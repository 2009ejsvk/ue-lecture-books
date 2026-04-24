---
title: 260402 초급 3편 - 공격 입력과 총알 스폰
---

# 초급 3편. 공격 입력과 총알 스폰

[이전: 초급 2편](../02_beginner_bpplayer_and_shoulder_camera/) | [허브](../) | [다음: 부록 1](../04_appendix_official_docs_reference/)

## 이 편의 목표

이 편에서는 `IA_Attack`, `BPBullet`, `Projectile Movement`, `Spawn Actor from Class`, `Forward Vector`를 연결해서 공격 입력이 어떻게 발사체 생성으로 이어지는지 정리한다.
핵심은 메시를 직접 쏘는 것이 아니라, 월드에 새 액터를 올바른 위치와 방향으로 생성하는 것이다.

## 봐야 할 자료

- `D:\UE_Academy_Stduy_compressed\260402_3_액터 스폰과 회전.mp4`
- `D:\UE_Academy_Stduy_compressed\260402_3_액터 스폰과 회전_2.mp4`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Test\TestBullet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Etc\ProjectileBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\WraithBullet.cpp`

## 전체 흐름 한 줄

`IA_Attack 추가 -> BPBullet 제작 -> Projectile Movement 부착 -> Spawn Actor from Class -> Forward Vector와 Rotation으로 방향 제어`

## 공격 입력은 결국 "새 액터를 월드에 만든다"는 뜻이다

세 번째 강의는 `IA_Attack`를 추가하는 데서 출발한다.
겉으로 보면 마우스 클릭을 연결하는 장면처럼 보이지만, 실제로는 "플레이어 입력으로 다른 액터를 생성하는 법"을 배우는 파트다.
즉 이 날짜의 공격은 아직 데미지 시스템보다 앞단에 있는 스폰 시스템 입문이라고 보는 편이 맞다.

![공격 입력과 플레이어 시점에서 보는 발사 준비](../assets/images/attack-input-player-view.jpg)

## 메시를 직접 쏘지 않고 `BPBullet` 액터를 만드는 이유

강의에서 중요한 문장은 "메시는 액터가 아니다"라는 설명이다.
이 한 문장이 이후 전투 시스템까지 계속 이어진다.

- `Static Mesh`
  액터 안에 들어가는 보이는 자원
- `Actor`
  월드에 존재하고, 움직이고, 충돌하고, 수명주기를 가지는 단위

그래서 총알처럼 날아가는 물체는 메시 하나가 아니라, 메시를 품은 별도 액터 `BPBullet`로 만드는 편이 맞다.
이 사고방식은 나중의 스킬 액터, 몬스터 스폰, 파괴 오브젝트에도 그대로 확장된다.

![BPBullet 클래스와 Projectile Movement 세팅](../assets/images/bpbullet-class-setup.jpg)

## `Projectile Movement`는 발사체다운 움직임을 가장 빨리 만든다

`BPBullet`에 `Projectile Movement`를 붙이면 Tick에서 매 프레임 위치를 수동 계산하지 않아도 된다.
언리얼이 발사체용 이동 규칙을 이미 제공하고 있기 때문이다.

현재 C++ 예제 `ATestBullet`은 이 구조를 가장 얇게 보여 준다.

```cpp
mMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
SetRootComponent(mMesh);

mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
mMovement->SetUpdatedComponent(mMesh);
mMovement->ProjectileGravityScale = 0.f;
mMovement->InitialSpeed = 1000.f;
```

즉 `260402`의 총알은 단순 장난감 오브젝트가 아니라, 뒤에서 충돌과 데미지를 얹을 발사체 구조의 씨앗이다.

## `Spawn Actor from Class`는 "무엇을, 어디에, 어느 방향으로"의 문제다

강의 후반 핵심은 `Spawn Actor from Class` 노드다.
이 노드를 이해할 때는 세 질문으로 나누면 된다.

- 무엇을 생성할 것인가
- 어디에 생성할 것인가
- 어느 방향으로 생성할 것인가

![Spawn Actor from Class를 추가하는 장면](../assets/images/spawn-actor-from-class-node.png)

여기서 `Transform`이 어렵게 느껴질 수 있는데, 처음에는 `Location`과 `Rotation`만 분리해서 이해해도 충분하다.

- 위치
  플레이어 앞쪽으로 얼마나 띄울지
- 회전
  플레이어가 현재 어디를 바라보는지

![Spawn Transform과 Rotation 설명 장면](../assets/images/spawn-transform-rotation.jpg)

## 현재 `APlayerCharacter` 소스에도 초기 발사 실험 흔적이 남아 있다

현재 프로젝트의 `APlayerCharacter::AttackKey()`는 지금은 `InputAttack()`만 호출하지만, 바로 아래 주석에 `260402`식 발사체 스폰 프로토타입이 남아 있다.

```cpp
FVector SpawnLoc = GetActorLocation() + GetActorForwardVector() * 150.f;

FActorSpawnParameters Param;
Param.SpawnCollisionHandlingOverride =
    ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

TObjectPtr<ATestBullet> Bullet =
    GetWorld()->SpawnActor<ATestBullet>(SpawnLoc, GetActorRotation(), Param);

Bullet->SetLifeSpan(5.f);
```

이 코드는 강의 핵심을 아주 잘 요약한다.
현재 위치를 읽고, 앞 방향을 계산하고, 그 방향으로 새 액터를 생성하는 구조다.

## `Forward Vector`와 화살표 기준은 방향 감각을 눈으로 확인하게 만든다

발사체가 엉뚱한 방향으로 나가는 문제는 대부분 액터의 앞 방향을 정확히 이해하지 못해서 생긴다.
그래서 언리얼에서는 `Forward Vector`와 `Arrow Component`를 함께 보는 습관이 중요하다.

![Forward 방향과 Arrow 기준을 확인하는 장면](../assets/images/pawn-forward-arrow.jpg)

나중 날짜의 몬스터 클래스도 에디터 전용 `ArrowComponent`를 둔다.
즉 방향 기준을 눈으로 확인하는 습관은 플레이어 총알뿐 아니라 모든 액터 스폰 문제를 더 쉽게 만든다.

## `BPBullet`은 이후 `AProjectileBase`, `AWraithBullet`로 성장한다

현재 프로젝트의 `AProjectileBase`는 충돌용 바디와 `ProjectileMovement`를 두고, 정지 이벤트를 받을 준비를 한다.

```cpp
mBody = CreateDefaultSubobject<UBoxComponent>(TEXT("Body"));
mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));

SetRootComponent(mBody);
mMovement->SetUpdatedComponent(mBody);
mMovement->OnProjectileStop.AddDynamic(this, &AProjectileBase::ProjectileStop);
```

그리고 `AWraithBullet`는 여기에 파티클, 사운드, 데칼, 히트 처리를 덧붙인다.
즉 `260402`에서 만든 `BPBullet`은 훗날 실제 전투용 발사체로 자라나는 가장 작은 원형이다.

![컴포넌트 기반 발사체 구조 미리보기](../assets/images/projectile-from-component.jpg)

## 이 편의 핵심 정리

1. 공격 입력은 결국 새 액터를 월드에 생성하는 문제로 이어진다.
2. 총알은 메시가 아니라 `BPBullet` 같은 별도 액터로 만드는 편이 맞다.
3. `Projectile Movement`는 발사체다운 움직임을 가장 빠르게 제공한다.
4. `Spawn Actor`, `Transform`, `Forward Vector`를 함께 이해해야 발사 방향이 제대로 잡힌다.
5. 이 구조는 이후 `AProjectileBase`, `AWraithBullet` 같은 실제 전투 코드로 확장된다.

## 다음 편

[부록 1. 공식 문서로 다시 읽는 플레이어와 스폰](../04_appendix_official_docs_reference/)
