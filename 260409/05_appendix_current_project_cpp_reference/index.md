---
title: 260409 05 현재 프로젝트 C++로 다시 읽는 전투 결과 파이프라인
---

# 260409 05 현재 프로젝트 C++로 다시 읽는 전투 결과 파이프라인

[이전: 04 공식 문서](../04_appendix_official_docs_reference/) | [260409 허브](../) | [다음 날짜: 260410](../../260410/)

## 문서 개요

현재 프로젝트 C++ 기준으로 `260409`를 다시 읽으면, 핵심은 여러 기능을 배우는 것이 아니라 `타격 시점 -> 판정 -> 피해 -> 피드백`을 한 줄로 잇는 데 있다.

## 1. 타격 시점은 `UAnimNotify_PlayerAttack`가 연다

현재 branch에서 `UAnimNotify_PlayerAttack::Notify()`는 `APlayerCharacterGAS`를 기준으로 주인을 얻고, 그 시점에 `NormalAttack()`을 호출한다.

```cpp
TObjectPtr<APlayerCharacterGAS> PlayerChar =
    MeshComp->GetOwner<APlayerCharacterGAS>();

if (IsValid(PlayerChar))
{
    PlayerChar->NormalAttack();
}
```

즉 입력 순간이 아니라 `애니메이션 안의 정확한 프레임`이 실제 판정의 출발점이다.

## 2. 현재 branch에는 legacy 전투 예제와 GAS 전투 라인이 함께 있다

- legacy 예제: `APlayerCharacter`, `AShinbi`, `AWraith`, `AMonsterBase`
- GAS 라인: `APlayerCharacterGAS`, `AShinbiGAS`, `AWraithGAS`

이 두 층은 완전히 분리된 게 아니라, 상당수 전투 로직을 공유한다.
예를 들어 `AShinbiGAS::NormalAttack()`도 여전히 캡슐 Sweep으로 히트를 모으고, `AWraithGAS::NormalAttack()`도 같은 `AWraithBullet`을 스폰한다.

즉 `260409` 교안은 legacy 예제로 설명해도 되지만, 최신 branch 연결성은 GAS 라인까지 같이 보면 더 정확하다.

## 3. 근접 전투는 `Shinbi`와 `ShinbiGAS`가 같은 뼈대를 공유한다

두 구현 모두 캐릭터 앞쪽 캡슐 Sweep을 날린다.
차이는 `히트 결과를 어떻게 해석하느냐`에 있다.

- legacy `AShinbi::NormalAttack()`
  `TakeDamage()`, 사운드, 파티클을 바로 호출한다.
- `AShinbiGAS::NormalAttack()`
  `Ability.Attack` 이벤트와 `TargetData`를 보내 GAS 쪽으로 넘긴다.

즉 `260409`의 근접 판정 구조는 최신 branch에서도 살아 있지만, 결과 처리 층이 GAS로 옮겨 가고 있는 셈이다.

## 4. 피해를 실제 상태 변화로 바꾸는 건 맞은 쪽 클래스다

플레이어든 몬스터든, 공격자가 하는 일은 결국 `TakeDamage()`를 호출하는 데서 끝난다.
그 이후의 실제 해석은 피해자 쪽 클래스가 맡는다.

- `APlayerCharacterGAS::TakeDamage()`
  방어력을 빼고, HP를 줄이고, 디버그 메시지를 출력한다.
- `AMonsterBase::TakeDamage()`
  방어력 보정, HP 감소, 죽음 애님 전환, AI 정지, 충돌 제거, 이동 정지까지 이어진다.

즉 `260409`의 관점은 `공격하는 코드`보다 `맞은 뒤 무엇이 변하는가`를 같이 보는 데 있다.

## 5. 원거리 전투는 `AWraithBullet`이 결과를 끝까지 밀어 준다

현재 `AWraithBullet::BulletHit()`은 이미 꽤 완성된 구조다.

1. 히트 시 자신을 제거한다.
2. `OtherActor->TakeDamage(...)`를 호출한다.
3. 히트 파티클을 재생한다.
4. 히트 사운드를 재생한다.
5. 히트 데칼을 남긴다.

즉 원거리 전투는 탄환 액터 하나가 `피해 전달 + 시각/청각 피드백`을 같이 들고 가는 구조다.

## 6. `ProjectileBase`는 공통 틀, `WraithBullet`은 실제 결과 담당

`AProjectileBase`는 `UBoxComponent`, `UProjectileMovementComponent`, `OnProjectileStop` 바인딩까지를 공통으로 제공한다.
반면 `ProjectileStop()`은 비어 있으므로, 실제 히트 처리와 피드백은 `AWraithBullet`이 채운다.

즉 최신 branch에서도 `공용 발사체 골격`과 `발사체별 전투 결과`를 분리하는 설계가 유지된다.

## 7. 이 날짜를 현재 branch 기준으로 한 줄로 요약하면

`260409`는 여전히 유효하다.
다만 현재 branch에서는 그 구조가 더 넓어져서, `legacy 판정/데미지 예제`와 `GAS 이벤트 라인`이 동시에 공존하는 상태다.

그래서 이 날짜를 다시 읽을 때는 이렇게 보면 된다.

- 전투 애니메이션의 시간축과 판정 뼈대는 그대로 유지된다.
- 근접과 원거리의 물리적 판정 방식도 크게 유지된다.
- 결과 해석 층은 일부가 GAS 쪽으로 이동하고 있다.

## 정리

현재 프로젝트 C++ 기준으로 보면 `260409`의 핵심 호출 흐름은 아래처럼 읽힌다.

`AnimNotify -> NormalAttack -> Sweep/Projectile -> TakeDamage -> Sound/Particle/Decal`

이 구조가 다음 날짜의 총구 소켓, 데칼, 상하체 분리, 스킬 캐스팅 확장의 출발점이 된다.

[이전: 04 공식 문서](../04_appendix_official_docs_reference/) | [260409 허브](../) | [다음 날짜: 260410](../../260410/)
