---
title: 260406 부록 2 - 현재 프로젝트 C++로 다시 읽는 전환 구조
---

# 부록 2. 현재 프로젝트 C++로 다시 읽는 전환 구조

[이전: 부록 1](../04_appendix_official_docs_reference/) | [허브](../) | [다음 날짜: 260407](../../260407/)

## 이 부록의 목표

이 부록에서는 `260406`의 플레이어 C++ 전환 구조가 현재 `UE20252` branch에서 어떤 모습으로 남아 있는지 다시 읽는다.
핵심은 강의의 `PlayerCharacter / Shinbi / InputData / GameMode` 축이 사라진 것이 아니라, 이후 GAS 플레이어 구조의 바닥이 되었다는 점을 확인하는 것이다.

## 같이 볼 코드

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerCharacter.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerCharacter.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\Shinbi.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\Wraith.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Input\InputData.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GameMode\DefaultGameMode.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\MainPlayerController.cpp`

## `APlayerCharacter` 헤더만 봐도 공통부와 확장부가 나뉜다

현재 헤더는 `APlayerCharacter`가 왜 공통 플레이어 베이스인지 아주 잘 보여 준다.

```cpp
TObjectPtr<USpringArmComponent> mSpringArm;
TObjectPtr<UCameraComponent> mCamera;
TObjectPtr<class UPlayerAnimInstance> mAnimInst;

void MoveKey(const FInputActionValue& Value);
void RotationKey(const FInputActionValue& Value);
void JumpKey(const FInputActionValue& Value);
void AttackKey(const FInputActionValue& Value);

virtual void InputAttack();
virtual void Skill1();
virtual void NormalAttack();
virtual void Skill1Casting();
```

즉 카메라와 입력 루프는 공통부에 두고, 실제 공격 내용은 가상 함수로 열어 두는 구조다.

## 생성자는 블루프린트 실험을 재사용 가능한 코드로 굳힌다

`APlayerCharacter` 생성자는 `SpringArm`, `Camera`, 회전 옵션, 점프 높이, 충돌 프로파일을 한 번에 묶어 둔다.
이 코드는 블루프린트에서 손으로 맞추던 구성을 공통 코드로 굳히는 순간이라고 보면 된다.

```cpp
mSpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("Arm"));
mSpringArm->SetupAttachment(GetMesh());
mSpringArm->TargetArmLength = 200.f;
mSpringArm->SetRelativeLocation(FVector(0.0, 0.0, 150.0));
mSpringArm->SetRelativeRotation(FRotator(-10.0, 90.0, 0.0));

mCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
mCamera->SetupAttachment(mSpringArm);

bUseControllerRotationYaw = true;
GetCharacterMovement()->JumpZVelocity = 700.f;
GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
SetGenericTeamId(FGenericTeamId(TeamPlayer));
```

## `AShinbi`, `AWraith`는 외형과 개별 전투 구현을 맡는다

파생 클래스는 공통 카메라와 입력 구조를 다시 만들지 않는다.
대신 메시, 애니메이션 블루프린트, 개별 공격 구현을 붙인다.

- `AShinbi`
  메시/애님 클래스 연결, 마법진 기반 스킬 분기, 근접 공격
- `AWraith`
  메시/애님 클래스 연결, 머즐 소켓에서 `AWraithBullet` 스폰

즉 `260406`이 만든 분리가 실제 코드에서도 끝까지 살아 있다.

## `UDefaultInputData`는 현재도 입력 자산 창고 역할을 그대로 한다

`UDefaultInputData`는 지금도 `IMC_Default`와 `IA_Move`, `IA_Rotation`, `IA_Jump`, `IA_Attack`, `IA_Skill1`를 생성자에서 로드한다.

```cpp
static ConstructorHelpers::FObjectFinder<UInputMappingContext> InputContext(
    TEXT("/Script/EnhancedInput.InputMappingContext'/Game/Input/IMC_Default.IMC_Default'"));

static ConstructorHelpers::FObjectFinder<UInputAction> MoveAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Move.IA_Move'"));
```

즉 이 클래스는 지금도 "입력 자산 창고"라는 강의의 해석이 그대로 맞다.

## `BeginPlay`와 `SetupPlayerInputComponent`는 현재도 같은 역할 분리를 유지한다

`APlayerCharacter`는 여전히 `BeginPlay()`에서 컨텍스트를 등록하고, `SetupPlayerInputComponent()`에서 액션을 함수에 바인딩한다.

```cpp
const UDefaultInputData* InputData = GetDefault<UDefaultInputData>();
Subsystem->AddMappingContext(InputData->mContext, 0);
```

```cpp
Input->BindAction(InputData->FindAction(TEXT("Move")), ETriggerEvent::Triggered,
    this, &APlayerCharacter::MoveKey);
Input->BindAction(InputData->FindAction(TEXT("Attack")), ETriggerEvent::Started,
    this, &APlayerCharacter::AttackKey);
```

즉 강의의 입력 파이프라인 해설은 현재 코드 기준으로도 그대로 유효하다.

## `DefaultGameMode`는 현재 branch에서 GAS 폰으로 한 단계 더 발전했다

현재 `DefaultGameMode.cpp`는 `AShinbi`를 기본 폰으로 두지 않는다.
대신 같은 자리에 `AShinbiGAS`가 올라가 있다.

```cpp
//DefaultPawnClass = AShinbi::StaticClass();
//DefaultPawnClass = AWraith::StaticClass();
DefaultPawnClass = AShinbiGAS::StaticClass();

PlayerStateClass = AMainPlayerState::StaticClass();
PlayerControllerClass = AMainPlayerController::StaticClass();
```

이 차이는 중요하다.
하지만 동시에 `GameMode`가 기본 플레이어와 컨트롤러를 정한다는 `260406`의 핵심 구조 자체는 그대로 유지되고 있다는 뜻이기도 하다.

## `MainPlayerController`는 커서와 피킹 문맥을 계속 담당한다

컨트롤러 쪽 책임도 현재까지 유지된다.

```cpp
bShowMouseCursor = true;

FInputModeGameAndUI InputMode;
SetInputMode(InputMode);

GetHitResultUnderCursor(ECollisionChannel::ECC_GameTraceChannel5, true, Hit);
```

즉 마우스 커서, UI와 게임 입력 모드, 화면 피킹은 여전히 플레이어 몸체가 아니라 컨트롤러의 책임이다.

## 지금 기준으로 260406을 읽는 가장 좋은 방법

1. 강의 본문에서는 `공통 베이스 -> 입력 자산 -> 기본 조작 루프`를 먼저 잡는다.
2. 그다음 `PlayerCharacter.cpp`, `InputData.cpp`, `MainPlayerController.cpp`를 읽으며 대응 구조를 찾는다.
3. 마지막으로 `DefaultGameMode.cpp`를 보면, 이 구조가 현재 branch에서 GAS 플레이어 쪽으로 어떻게 확장됐는지 보인다.

## 이 부록의 핵심 정리

1. `APlayerCharacter`, `AShinbi`, `AWraith`, `UDefaultInputData` 구조는 현재 branch에서도 여전히 살아 있다.
2. `BeginPlay`와 `SetupPlayerInputComponent`의 역할 분리도 그대로 유지된다.
3. 현재 `DefaultGameMode`는 기본 폰을 `AShinbiGAS`로 바꿨지만, `260406`이 만든 진입점 구조 자체는 변하지 않았다.
4. 그래서 `260406`은 과거 강의이면서 동시에 지금 플레이어 구조를 읽는 출발점으로도 충분히 유효하다.
