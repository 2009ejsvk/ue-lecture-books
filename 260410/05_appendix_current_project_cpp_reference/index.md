---
title: 260410 05 현재 프로젝트 C++로 다시 읽는 공격 표현 파이프라인
---

# 260410 05 현재 프로젝트 C++로 다시 읽는 공격 표현 파이프라인

[이전: 04 공식 문서](../04_appendix_official_docs_reference/) | [260410 허브](../) | [다음 날짜: 260413](../../260413/)

## 문서 개요

현재 프로젝트 C++ 기준으로 `260410`을 다시 읽으면, 핵심은 공격 결과를 더 세게 만드는 게 아니라 `표현 계층을 어디에 나눠 둘 것인가`에 있다.

## 1. `Wraith`와 `WraithGAS`는 같은 총알 구조를 공유한다

legacy `AWraith`와 `AWraithGAS`는 둘 다 `Muzzle_01` 소켓에서 `AWraithBullet`을 스폰한다.
즉 현재 branch에서도 원거리 공격의 물리적 표현 계층은 거의 그대로 유지된다.

## 2. `ProjectileBase`는 공통 틀, `WraithBullet`은 결과 담당

`AProjectileBase`는 `Body`, `ProjectileMovement`, `OnProjectileStop`을 제공하지만, 실제 후속 처리는 비워 둔다.
반대로 `AWraithBullet`은 `OnComponentHit -> BulletHit`으로 데미지, 파티클, 사운드, 데칼까지 한 번에 마무리한다.

즉 구조는 이렇게 읽는 편이 가장 정확하다.

- 공통 이동 틀: `AProjectileBase`
- 발사체별 실제 전투 결과: `AWraithBullet`

## 3. `DecalBase`는 총알 자국과 마법진의 공통 접점이다

`ADecalBase`는 매우 얇지만, 그래서 더 중요하다.
프로젝트가 데칼을 직접 `UDecalComponent`로 다루지 않고, 전용 액터 계층으로 감싸 두었기 때문이다.

덕분에 현재 `Shinbi::Skill1Casting()`과 향후 데칼 계열 연출이 같은 접점을 공유할 수 있다.

## 4. `PlayerAnimInstance`와 `PlayerTemplateAnimInstance`는 지금 GAS 플레이어 라인을 본다

현재 branch의 `UPlayerAnimInstance::NativeUpdateAnimation()`과 `UPlayerTemplateAnimInstance::AnimNotify_SkillCasting()`는 `APlayerCharacterGAS`를 기준으로 캐스팅한다.
즉 애님 인스턴스 계층은 이미 GAS 플레이어 라인 쪽으로 옮겨간 상태다.

반면 `260410`의 교안 흐름 자체는 legacy `AShinbi`, `AWraith` 예제가 가장 직관적이어서, 문서는 두 층을 함께 병기하는 편이 가장 자연스럽다.

## 5. `Shinbi` 스킬 흐름은 legacy 쪽이 더 선명하다

legacy `AShinbi`에서는 흐름이 비교적 완결돼 있다.

- `Skill1()`: `PlaySkill1()` 호출
- `AnimNotify_SkillCasting()`: 정확한 프레임에서 `Skill1Casting()` 호출
- `Skill1Casting()`: `ADecalBase`로 마법진 생성
- `InputAttack()`: `mMagicCircleActor`가 있으면 스킬 액터 생성까지 연결

반면 `AShinbiGAS`는 `Skill1()`과 `Skill1Casting()`은 유지되지만, `InputAttack()`에서 마법진 확정 분기 일부가 주석 처리돼 있다.
즉 스킬 캐스팅 수업 맥락은 여전히 legacy `AShinbi`로 읽는 편이 이해가 쉽다.

## 6. 현재 branch 기준 한 줄 요약

`260410`의 구조는 지금도 유효하다.
다만 최신 저장소에서는 아래처럼 읽어 두는 게 제일 정확하다.

- 투사체, 데칼, 캐스팅 모션이라는 표현 계층은 그대로 유지된다.
- 원거리 총알과 데칼 구조는 legacy와 GAS 모두에서 거의 그대로 재사용된다.
- 애님 인스턴스와 노티파이 소유자 계층은 GAS 플레이어 라인으로 이동했다.
- 스킬 캐스팅의 전체 설명 흐름은 legacy `Shinbi`가 여전히 가장 선명하다.

## 정리

현재 프로젝트 C++ 기준으로 보면 `260410`의 핵심 흐름은 아래처럼 묶인다.

`Attack/Skill 입력 -> Montage/Notify -> Socket 또는 Decal 기준 위치 결정 -> Projectile/Decal/Upper-Body Pose로 표현 완성`

이 구조가 다음 날짜의 마우스 피킹, 위치 지정형 스킬, Geometry Collection 파괴와 자연스럽게 이어진다.

[이전: 04 공식 문서](../04_appendix_official_docs_reference/) | [260410 허브](../) | [다음 날짜: 260413](../../260413/)
