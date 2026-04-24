---
title: 260407 부록 2 - 현재 프로젝트 C++로 다시 읽는 애님 파이프라인
---

# 부록 2. 현재 프로젝트 C++로 다시 읽는 애님 파이프라인

[이전: 부록 1](../05_appendix_official_docs_reference/) | [허브](../) | [다음 날짜: 260408](../../260408/)

## 이 부록의 목표

이 부록에서는 `260407`의 애님 구조가 현재 `UE20252` branch에서 어떤 코드와 연결되는지 다시 읽는다.
핵심은 애님 블루프린트만 보면 반쪽 이해고, 실제 변수 계산과 노티파이 연결은 C++ 중간 레이어에서 이뤄진다는 점을 확인하는 것이다.

## 같이 볼 코드

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerAnimInstance.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerTemplateAnimInstance.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerTemplateAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerCharacter.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\Shinbi.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\Wraith.cpp`

## 현재 branch는 `APlayerCharacter` 대신 `APlayerCharacterGAS`를 바라본다

강의 원형은 `TryGetPawnOwner()`를 `APlayerCharacter`로 캐스팅하는 흐름을 기준으로 읽으면 된다.
다만 현재 branch의 실제 구현은 한 단계 더 진행돼 있다.

```cpp
TObjectPtr<APlayerCharacterGAS> PlayerChar =
    Cast<APlayerCharacterGAS>(TryGetPawnOwner());
```

즉 애님 변수 계산과 노티파이 구조는 그대로 유지되고, 그 위에 붙는 플레이어 베이스만 GAS 라인으로 바뀐 상태다.

## `UPlayerAnimInstance`는 여전히 공용 상태 저장소다

헤더를 보면 `UPlayerAnimInstance`의 책임은 아주 분명하다.

```cpp
float mMoveSpeed;
float mViewPitch;
float mViewYaw;
bool mIsInAir;
bool mAccelerating;
float mYawDelta;

TObjectPtr<UAnimMontage> mAttackMontage;
TArray<FName> mAttackSection;
```

즉 로코모션용 변수와 전투 몽타주 기반이 한 클래스에 함께 들어 있다.
그래서 `260407`의 로코모션 강의와 `260408`의 몽타주 강의가 자연스럽게 이어진다.

## `NativeUpdateAnimation()`가 로코모션 변수를 매 프레임 계산한다

핵심 계산은 `UPlayerAnimInstance::NativeUpdateAnimation()` 안에서 이뤄진다.

```cpp
UCharacterMovementComponent* Movement = PlayerChar->GetCharacterMovement();

mMoveSpeed = Movement->Velocity.Length();
mIsInAir = Movement->IsFalling();

float Acceleration = Movement->GetCurrentAcceleration().Length();
mAccelerating = Acceleration > 0.f;

FRotator CurrentRot = PlayerChar->GetActorRotation();
FRotator DeltaRot = UKismetMathLibrary::NormalizedDeltaRotator(CurrentRot, mPrevRotator);

float DeltaYaw = DeltaRot.Yaw / DeltaSeconds / 7.f;
mYawDelta = FMath::FInterpTo(mYawDelta, DeltaYaw, DeltaSeconds, 6.f);

mPrevRotator = CurrentRot;
```

즉 `mMoveSpeed`, `mIsInAir`, `mAccelerating`, `mYawDelta`는 그래프 안에서 우연히 생기는 값이 아니라, 캐릭터 무브먼트 상태를 애님용 언어로 번역한 결과다.

## `RotationKey()`는 카메라와 시선 값을 동시에 갱신한다

앞 장에서 본 `Aim Offset`의 입력은 실제로 `PlayerCharacter::RotationKey()`에서 온다.

```cpp
mSpringArm->AddRelativeRotation(FRotator(Axis.Y, Axis.X, 0.0));

mAnimInst->AddViewPitch(Axis.Y);
mAnimInst->AddViewYaw(Axis.X);
```

즉 같은 입력 하나가

- 실제 플레이 화면 시점
- 애님 시선 보정 변수

두 군데로 동시에 흘러간다.

## `UPlayerTemplateAnimInstance`는 공용 그래프 틀과 자산 교체를 분리한다

이 클래스는 로직을 크게 더하지 않고, 캐릭터별 자산을 이름으로 관리하는 사전 구조를 제공한다.

```cpp
TMap<FString, TObjectPtr<UAnimSequence>> mAnimMap;
TMap<FString, TObjectPtr<UBlendSpace>> mBlendSpaceMap;
```

즉 `ABPPlayerTemplate`는 `"JumpStart"`, `"Land"`, `"Aim"`, `"Run"` 같은 키만 알면 되고, 실제 자산 차이는 캐릭터별 템플릿이 채우는 식이다.
이 구조 덕분에 `ABPShinbiTemplate`와 `ABPWraithTemplate`가 같은 그래프를 공유하면서도 다른 자산을 쓸 수 있다.

## 노티파이도 이 레이어에서 다시 게임플레이 코드로 돌아간다

현재 `UPlayerTemplateAnimInstance`는 `AnimNotify_SkillCasting()`에서 다시 플레이어 함수로 돌아간다.

```cpp
TObjectPtr<APlayerCharacterGAS> PlayerChar =
    Cast<APlayerCharacterGAS>(TryGetPawnOwner());

if (IsValid(PlayerChar))
{
    PlayerChar->Skill1Casting();
}

mSkill1Index = (mSkill1Index + 1) % mSkill1Section.Num();
```

즉 애님 레이어는 단순히 값을 받는 객체가 아니라, 나중에는 `노티파이 -> C++ 함수 호출 -> 실제 게임플레이`의 다리 역할까지 맡는다.

## 캐릭터별 클래스는 같은 틀 위에 다른 애님 블루프린트를 연결한다

`Shinbi.cpp`와 `Wraith.cpp`를 보면 둘 다 `APlayerCharacter` 기반 위에서 자기 애님 블루프린트만 다르게 연결한다.

```cpp
// Shinbi
GetMesh()->SetAnimInstanceClass(AnimClass.Class);

// Wraith
GetMesh()->SetAnimInstanceClass(AnimClass.Class);
```

즉 공통 로코모션 로직은 다시 짜지 않고, 같은 틀 위에 캐릭터별 자산만 바꾸는 것이 현재 프로젝트의 기본 방향이다.

## 지금 기준으로 260407을 읽는 가장 좋은 방법

1. 본문에서는 `AnimInstance -> Aim Offset -> GroundLoco -> Jump` 흐름을 먼저 잡는다.
2. 그다음 `PlayerAnimInstance.cpp`를 보며 변수 계산이 어디서 나오는지 확인한다.
3. 마지막으로 `PlayerTemplateAnimInstance.cpp`, `Shinbi.cpp`, `Wraith.cpp`를 보면 공용 틀과 캐릭터별 자산 분리가 어떻게 닫히는지 보인다.

## 이 부록의 핵심 정리

1. `260407`의 애님 구조는 현재 branch에서도 그대로 유효하다.
2. 달라진 점은 소유 플레이어가 `APlayerCharacter`에서 `APlayerCharacterGAS`로 확장된 정도다.
3. 변수 계산은 `UPlayerAnimInstance`, 자산 교체와 노티파이는 `UPlayerTemplateAnimInstance`가 맡는다.
4. 그래서 `260407`은 과거 로코모션 강의이면서도, 지금 애님 파이프라인을 읽는 출발점으로 여전히 충분히 유효하다.
