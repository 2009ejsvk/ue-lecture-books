---
title: 260402 부록 2 - 현재 프로젝트 C++로 다시 읽는 플레이어와 발사체
---

# 부록 2. 현재 프로젝트 C++로 다시 읽는 플레이어와 발사체

[이전: 부록 1](../04_appendix_official_docs_reference/) | [허브](../)

## 이 부록의 목표

이 부록에서는 `260402`의 블루프린트 개념이 현재 `UE20252` C++ 코드에서 어떤 구조로 남아 있는지 다시 읽는다.
핵심은 `BPPlayer`와 `BPBullet`이 사라진 것이 아니라, `APlayerCharacter`, `UDefaultInputData`, `ATestBullet`, `AProjectileBase`, `AWraithBullet`로 더 선명하게 굳어졌다는 점이다.

## 같이 볼 코드

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerCharacter.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Input\InputData.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Test\TestBullet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Etc\ProjectileBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\WraithBullet.cpp`

## `APlayerCharacter` 생성자는 `Spring Arm + Camera` 패턴을 그대로 코드화한다

블루프린트에서 손으로 하던 카메라 세팅은 현재 `APlayerCharacter` 생성자에 그대로 들어 있다.

```cpp
mSpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("Arm"));
mSpringArm->SetupAttachment(GetMesh());
mSpringArm->TargetArmLength = 200.f;
mSpringArm->SetRelativeLocation(FVector(0.0, 0.0, 150.0));
mSpringArm->SetRelativeRotation(FRotator(-10.0, 90.0, 0.0));

mCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
mCamera->SetupAttachment(mSpringArm);
```

즉 `260402`의 숄더뷰 세팅은 훗날 없어지는 임시 작업이 아니라, 실제 플레이어 클래스 생성자에 굳는 기본 설계다.

![BPPlayer 컴포넌트와 기본 구조](../assets/images/bpplayer-components.jpg)

## `UDefaultInputData`는 입력 자산 묶음을 코드가 직접 관리하는 방식이다

현재 프로젝트는 입력 자산을 `UDefaultInputData` 안에서 로드한다.

```cpp
static ConstructorHelpers::FObjectFinder<UInputMappingContext> InputContext(
    TEXT("/Script/EnhancedInput.InputMappingContext'/Game/Input/IMC_Default.IMC_Default'"));

static ConstructorHelpers::FObjectFinder<UInputAction> MoveAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Move.IA_Move'"));

static ConstructorHelpers::FObjectFinder<UInputAction> RotationAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Rotation.IA_Rotation'"));

static ConstructorHelpers::FObjectFinder<UInputAction> AttackAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Attack.IA_Attack'"));
```

즉 블루프린트에서 자산으로 만들던 `IA_Move`, `IA_Rotation`, `IA_Attack`가 현재는 코드에서 직접 로드되는 공용 입력 세트로 정리된 셈이다.

![BeginPlay에서 Add Mapping Context를 추가하는 장면](../assets/images/add-mapping-context-node.png)

## `BeginPlay`와 `SetupPlayerInputComponent`가 블루프린트 입력 연결을 대신한다

현재 `APlayerCharacter`는 `BeginPlay()`에서 `AddMappingContext`를 호출하고, `SetupPlayerInputComponent()`에서 액션별 함수를 묶는다.

```cpp
Subsystem->AddMappingContext(InputData->mContext, 0);

Input->BindAction(InputData->FindAction(TEXT("Move")),
    ETriggerEvent::Triggered, this, &APlayerCharacter::MoveKey);
Input->BindAction(InputData->FindAction(TEXT("Rotation")),
    ETriggerEvent::Triggered, this, &APlayerCharacter::RotationKey);
Input->BindAction(InputData->FindAction(TEXT("Attack")),
    ETriggerEvent::Started, this, &APlayerCharacter::AttackKey);
```

즉 블루프린트의 이벤트 노드가 C++에서는 `BindAction` 호출로 대응된다고 보면 된다.

## `AttackKey()` 주석은 `260402` 당시의 발사체 스폰 프로토타입을 그대로 보존한다

흥미로운 점은 현재 `AttackKey()` 본문 아래에 초기 발사 실험 코드가 주석으로 남아 있다는 점이다.

```cpp
FVector SpawnLoc = GetActorLocation() + GetActorForwardVector() * 150.f;

TObjectPtr<ATestBullet> Bullet =
    GetWorld()->SpawnActor<ATestBullet>(SpawnLoc, GetActorRotation(), Param);

Bullet->SetLifeSpan(5.f);
```

이 주석은 `260402` 핵심을 그대로 요약한다.
현재 위치, 현재 방향, 새 총알 액터 생성이라는 세 요소만으로 공격 입력의 원형이 성립한다.

## `ATestBullet -> AProjectileBase -> AWraithBullet`로 발사체가 성장한다

`ATestBullet`은 가장 얇은 총알 예제다.
`StaticMesh`와 `ProjectileMovement`만으로 직진형 발사체를 만든다.

```cpp
mMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
SetRootComponent(mMesh);

mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
mMovement->SetUpdatedComponent(mMesh);
mMovement->ProjectileGravityScale = 0.f;
mMovement->InitialSpeed = 1000.f;
```

`AProjectileBase`는 충돌체와 공통 발사체 구조를 가진 베이스이고, `AWraithBullet`는 여기에 파티클, 사운드, 데칼, 히트 처리를 덧붙인다.

```cpp
mMovement->OnProjectileStop.AddDynamic(this, &AProjectileBase::ProjectileStop);
mBody->OnComponentHit.AddDynamic(this, &AWraithBullet::BulletHit);
```

즉 블루프린트의 `BPBullet`은 현재 프로젝트에서 더 일반화된 발사체 계층으로 자라난 상태다.

![컴포넌트 기반 발사체 구조 미리보기](../assets/images/projectile-from-component.jpg)

## 지금 기준으로 260402를 읽는 가장 좋은 방법

1. 블루프린트 편에서는 `Spring Arm`, `Mapping Context`, `Spawn Actor` 개념을 먼저 잡는다.
2. 그다음 `PlayerCharacter.cpp`, `InputData.cpp`, `TestBullet.cpp`를 읽으며 대응 구조를 찾는다.
3. 마지막으로 `ProjectileBase.cpp`, `WraithBullet.cpp`를 보면 발사체가 실전 코드로 성장하는 경로가 보인다.

## 이 부록의 핵심 정리

1. `BPPlayer` 실습은 현재 `APlayerCharacter`와 `UDefaultInputData` 구조로 이어진다.
2. `BPBullet` 실습은 `ATestBullet`, `AProjectileBase`, `AWraithBullet`로 확장된다.
3. `260402`는 입문 강의이지만, 현재 프로젝트 플레이어/발사체 구조를 읽는 출발점으로도 충분히 유효하다.
