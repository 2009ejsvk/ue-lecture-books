---
title: 20260421 초급 2편 - Jump Ability로 보는 GAS 생명주기
---

# 초급 2편. Jump Ability로 보는 GAS 생명주기

[이전: 초급 1편](../01_beginner_gas_overview/) | [허브](../) | [다음: 중급 1편](../03_intermediate_attributes_and_effects/)

## 이 편의 목표

이 편에서는 `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Abilities\GDGA_CharacterJump.cpp`를 기준으로, GAS Ability가 실제로 어떤 흐름으로 움직이는지 본다.

점프는 익숙한 행동이라서, GAS 함수 이름을 처음 익히기에 가장 좋다.

## 전체 흐름 한 줄

`점프 입력 -> CanActivateAbility -> ActivateAbility -> CommitAbility -> Character->Jump() -> InputReleased -> CancelAbility -> Character->StopJumping()`

## 생성자에서 하는 일

```cpp
UGDGA_CharacterJump::UGDGA_CharacterJump()
{
    AbilityInputID = EGDAbilityInputID::Jump;
    InstancingPolicy = EGameplayAbilityInstancingPolicy::NonInstanced;
    AbilityTags.AddTag(FGameplayTag::RequestGameplayTag(FName("Ability.Jump")));
}
```

이 생성자에서 보는 포인트는 세 가지다.

- 이 Ability가 어떤 입력 슬롯에 연결되는가
- 실행할 때 인스턴스를 따로 만들 것인가
- 어떤 태그를 가질 것인가

여기서 `AbilityInputID`는 이 예제의 커스텀 필드다.
정의는 `GDGameplayAbility.h`에 있다.

반면 `InstancingPolicy`, `AbilityTags`는 GAS 기본 개념이다.

## `CanActivateAbility()`는 검사 함수다

```cpp
bool UGDGA_CharacterJump::CanActivateAbility(...) const
{
    if (!Super::CanActivateAbility(...))
    {
        return false;
    }

    const AGDCharacterBase* Character =
        CastChecked<AGDCharacterBase>(ActorInfo->AvatarActor.Get(), ECastCheckedType::NullAllowed);
    return Character && Character->CanJump();
}
```

이 함수의 의미는 단순하다.

`지금 점프를 써도 되는가`

여기서 두 단계 검사가 들어간다.

- `Super::CanActivateAbility(...)`
  GAS 기본 검사
- `Character->CanJump()`
  게임 전용 검사

즉 `CanActivateAbility()`는 발동 함수가 아니라, 발동 전 조건 검사 함수다.

## `ActivateAbility()`는 행동 시작 함수다

```cpp
void UGDGA_CharacterJump::ActivateAbility(...)
{
    if (HasAuthorityOrPredictionKey(ActorInfo, &ActivationInfo))
    {
        if (!CommitAbility(Handle, ActorInfo, ActivationInfo))
        {
            EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
        }

        ACharacter* Character = CastChecked<ACharacter>(ActorInfo->AvatarActor.Get());
        Character->Jump();
    }
}
```

여기서 중요한 줄은 `CommitAbility()`다.
이 함수는 보통 아래 의미를 가진다.

- 코스트 적용
- 쿨다운 적용
- 진짜 사용 확정

점프는 보통 코스트가 없더라도, GAS 생명주기상 “이 Ability가 여기서 확정된다”는 감각을 익히는 데 중요하다.

그리고 마지막에 `Character->Jump()`를 호출한다.
즉 GAS Ability는 기존 언리얼 동작을 감싸는 래퍼처럼도 쓸 수 있다.

## 왜 성공 후 바로 `EndAbility()`를 안 하나

점프는 버튼을 누르는 동안 유지되고, 버튼을 떼면 멈추는 성격이 있다.
그래서 시작과 동시에 끝내지 않고, 입력 해제 시점까지 유지한다.

이 차이를 이해하면 Ability를 둘로 나눠 볼 수 있다.

- 즉발형 Ability
  발동 후 바로 끝남
- 유지형 Ability
  입력 해제나 이벤트가 올 때까지 유지

점프는 유지형 쪽에 가깝다.

## `InputReleased()`는 입력 해제 콜백이다

```cpp
void UGDGA_CharacterJump::InputReleased(...)
{
    if (ActorInfo != NULL && ActorInfo->AvatarActor != NULL)
    {
        CancelAbility(Handle, ActorInfo, ActivationInfo, true);
    }
}
```

버튼을 떼면 `CancelAbility()`를 부른다.
즉 이 Ability는 “입력 해제”를 Ability 생명주기의 일부로 사용한다.

## `CancelAbility()`는 취소와 정리를 같이 한다

```cpp
void UGDGA_CharacterJump::CancelAbility(...)
{
    if (ScopeLockCount > 0)
    {
        WaitingToExecute.Add(...);
        return;
    }

    Super::CancelAbility(Handle, ActorInfo, ActivationInfo, bReplicateCancelAbility);

    ACharacter* Character = CastChecked<ACharacter>(ActorInfo->AvatarActor.Get());
    Character->StopJumping();
}
```

여기서 중요한 건 `CancelAbility()`가 단순히 GAS 상태만 끄는 게 아니라, 실제 캐릭터 행동도 멈춘다는 점이다.

즉 점프 Ability는 아래처럼 읽으면 된다.

- 시작할 때
  `Jump()`
- 취소될 때
  `StopJumping()`

## `NonInstanced`는 왜 가능할까

점프 Ability는 복잡한 런타임 상태를 오래 들고 있지 않는다.
몽타주 여러 개, 콤보 단계, 타겟 목록 같은 정보도 없다.

그래서 `NonInstanced`로도 충분하다.

반면 아래 같은 Ability는 보통 인스턴스가 있는 편이 낫다.

- 차징 스킬
- 몽타주 기반 연속 공격
- 타겟 데이터를 오래 들고 있는 스킬
- AbilityTask를 여러 개 묶는 스킬

## 초심자용 코드 읽기

아래 코드는 `GDGA_CharacterJump.cpp` 핵심 부분을 초심자용으로 다시 주석 달아 정리한 것이다.

```cpp
UGDGA_CharacterJump::UGDGA_CharacterJump()
{
    // 이 Ability를 "Jump 입력 슬롯"에 연결한다.
    // 예제 프로젝트는 enum 값으로 입력과 Ability를 묶는다.
    AbilityInputID = EGDAbilityInputID::Jump;

    // 점프는 복잡한 상태를 오래 들고 있지 않으므로
    // 매번 새 Ability 객체를 만들지 않는 NonInstanced를 쓴다.
    InstancingPolicy = EGameplayAbilityInstancingPolicy::NonInstanced;

    // 이 Ability가 점프 계열이라는 이름표를 붙인다.
    AbilityTags.AddTag(FGameplayTag::RequestGameplayTag(FName("Ability.Jump")));
}

bool UGDGA_CharacterJump::CanActivateAbility(...) const
{
    // 1차: GAS 기본 검사
    // 쿨다운, 코스트, 차단 태그 같은 공통 규칙을 먼저 본다.
    if (!Super::CanActivateAbility(...))
    {
        return false;
    }

    // 2차: 우리 게임 전용 검사
    // 실제 캐릭터가 지금 점프 가능한 상태인지 본다.
    const AGDCharacterBase* Character =
        CastChecked<AGDCharacterBase>(ActorInfo->AvatarActor.Get(), ECastCheckedType::NullAllowed);

    return Character && Character->CanJump();
}

void UGDGA_CharacterJump::ActivateAbility(...)
{
    // 서버이거나 예측 실행 권한이 있는 쪽에서만 실제로 실행한다.
    if (HasAuthorityOrPredictionKey(ActorInfo, &ActivationInfo))
    {
        // Ability 사용을 확정한다.
        // 코스트나 쿨다운이 있으면 여기서 처리된다.
        if (!CommitAbility(Handle, ActorInfo, ActivationInfo))
        {
            // 확정 실패면 Ability를 끝낸다.
            EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
        }

        // 실제 몸체(AvatarActor)를 ACharacter로 꺼낸다.
        ACharacter* Character = CastChecked<ACharacter>(ActorInfo->AvatarActor.Get());

        // 언리얼 기본 점프 함수 호출
        Character->Jump();
    }
}

void UGDGA_CharacterJump::InputReleased(...)
{
    // 점프 버튼을 떼면 Ability를 취소한다.
    if (ActorInfo != NULL && ActorInfo->AvatarActor != NULL)
    {
        CancelAbility(Handle, ActorInfo, ActivationInfo, true);
    }
}

void UGDGA_CharacterJump::CancelAbility(...)
{
    // GAS 내부가 잠금 상태면 지금 바로 취소하지 않고 나중으로 미룬다.
    if (ScopeLockCount > 0)
    {
        WaitingToExecute.Add(...);
        return;
    }

    // GAS 쪽 취소 처리를 먼저 한다.
    Super::CancelAbility(Handle, ActorInfo, ActivationInfo, bReplicateCancelAbility);

    // 그리고 실제 캐릭터 점프도 멈춘다.
    ACharacter* Character = CastChecked<ACharacter>(ActorInfo->AvatarActor.Get());
    Character->StopJumping();
}
```

이 코드에서 초심자가 제일 먼저 봐야 하는 줄은 아래 두 개다.

- `CommitAbility()`
  Ability 사용 확정
- `Character->Jump()`
  실제 행동 실행

즉 GAS는 행동을 무조건 새로 만드는 게 아니라, 기존 언리얼 함수도 `Ability 생명주기` 안에 넣어서 관리할 수 있다.

## 이 편에서 꼭 외울 함수 다섯 개

- `CanActivateAbility()`
  지금 쓸 수 있는지 검사
- `ActivateAbility()`
  Ability 시작
- `CommitAbility()`
  사용 확정
- `InputReleased()`
  버튼 해제 시점 처리
- `CancelAbility()`
  중간 취소와 정리

## 이 편의 핵심 정리

점프 Ability 하나만 봐도 GAS 생명주기의 기본형이 보인다.

`검사 -> 시작 -> 확정 -> 실제 행동 -> 입력 해제 -> 취소/정리`

즉 처음에는 복잡한 공격 Ability보다 점프 Ability가 더 좋은 입문 자료다.

## 공식 문서 연결

- [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine)
  Epic 문서는 Ability 기본 생명주기를 `CanActivateAbility -> CallActivateAbility/ActivateAbility -> TryActivateAbility -> EndAbility` 흐름으로 설명한다. 우리 예제의 `Jump`는 여기에 `InputReleased`와 `CancelAbility`가 붙은 가장 단순한 실전형이다.

- [UAbilityTask API Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/GameplayAbilities/UAbilityTask)
  공식 문서는 Ability가 보통 `Tick` 대신 `AbilityTask`를 통해 비동기 작업을 수행한다고 본다. `Jump`는 태스크 없이도 읽히는 예외적으로 단순한 Ability라서 입문용으로 좋다.

- [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine)
  같은 문서에서 `Instanced Per Execution`, `Instanced Per Actor`, `Non-Instanced` 정책 차이를 설명한다. `Jump`가 `NonInstanced`인 이유를 이해할 때 같이 보면 도움이 된다.

## 다음 편

[중급 1편. AttributeSet과 GameplayEffect 후처리](../03_intermediate_attributes_and_effects/)
