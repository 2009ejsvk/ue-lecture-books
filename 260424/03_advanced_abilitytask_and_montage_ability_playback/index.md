---
title: 260424 고급 1편 - AbilityTask와 몽타주 재생 책임 옮기기
---

# 고급 1편. AbilityTask와 몽타주 재생 책임 옮기기

[이전: 중급 2편](../02_intermediate_custom_abilitysystemcomponent_and_mana_cost/) | [허브](../) | [다음: 부록](../04_appendix_academyutility_dump_workflow/)

## 이 편의 목표

이 편에서는 현재 `AnimInstance`가 직접 들고 있는 몽타주 재생 책임을,
왜 나중에는 `AbilityTask`로 옮기려 하는지 큰 구조 관점에서 정리한다.

핵심은 아래 다섯 조각을 한 번에 연결해서 보는 것이다.

- `PlayerAnimInstance::PlayAttack()`
- `PlayerAnimInstance::PlaySkill1()`
- `PlayerTemplateAnimInstance::AnimNotify_SkillCasting()`
- `GameplayAbility_Base`의 `mMana`, `mCoolDown`
- `UGameplayEffect_CoolDown`과 태그 기반 쿨다운 설계

즉 이번 편은 "몽타주를 재생하는 법" 자체를 다시 배우는 편이 아니라,
`몽타주 재생 책임을 AnimInstance가 계속 가져가면 GAS 스킬 구조가 어디서 막히는가`를 설명하는 편이다.

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerTemplateAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\ShinbiGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_CoolDown.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGameplayTags.ini`

## 전체 흐름 한 줄

`입력 -> Ability 활성화 -> ManaCost / CoolDown 검사 -> 몽타주 재생 -> 완료 / 취소 / 인터럽트 후처리 -> EndAbility`

그리고 강의가 말하는 다음 단계는 아래처럼 읽으면 된다.

`입력 -> GameplayAbility -> AbilityTask_PlayMontageAndWait -> OnCompleted / OnInterrupted / OnBlendOut / OnCancelled -> 비용, 쿨다운, 후속 스킬 처리까지 Ability 안에서 닫기`

## 현재 branch는 아직 `AnimInstance`가 몽타주를 직접 재생한다

현재 `PlayerAnimInstance.cpp`를 보면 공격과 스킬 몽타주는 여전히 애님 인스턴스가 직접 재생한다.

```cpp
void UPlayerAnimInstance::PlayAttack()
{
    Montage_SetPosition(mAttackMontage, 0.f);
    Montage_Play(mAttackMontage, 1.f);
    Montage_JumpToSection(mAttackSection[0], mAttackMontage);
}
```

`PlaySkill1()`도 거의 같은 구조다.
그리고 몽타주 종료 후 상태 복구 역시 `MontageEndOverride()`에서 처리한다.

이 구조의 장점은 단순함이다.
하지만 GAS 스킬이 많아지면 아래 문제가 생긴다.

- Ability는 발동됐는데, 몽타주 종료/취소 결과는 AnimInstance가 들고 있다
- 스킬이 끊겼는지, 끝났는지, 중간에 취소됐는지 Ability가 직접 알기 어렵다
- 쿨다운 적용 시점을 AnimInstance와 Ability가 나눠 들게 된다

즉 지금 구조는 "재생은 잘 되는데, Ability 기준으로 생명주기를 닫기 어렵다"는 한계가 있다.

## `PlayerTemplateAnimInstance`도 아직 스킬 타이밍을 직접 쥐고 있다

`PlayerTemplateAnimInstance.cpp`를 보면 노티파이가 직접 캐릭터 함수를 호출한다.

```cpp
void UPlayerTemplateAnimInstance::AnimNotify_SkillCasting()
{
    TObjectPtr<APlayerCharacterGAS> PlayerChar = Cast<APlayerCharacterGAS>(TryGetPawnOwner());

    if (IsValid(PlayerChar))
    {
        PlayerChar->Skill1Casting();
    }

    mSkill1Index = (mSkill1Index + 1) % mSkill1Section.Num();
}
```

이 구조는 `260413` 같은 지정형 스킬 강의 흐름과는 잘 맞는다.
하지만 GAS 기준으로 보면 아래처럼 역할이 섞여 있다.

- `Ability`는 스킬 발동 비용을 관리한다
- `AnimInstance`는 재생과 섹션 전환을 관리한다
- `Character`는 실제 스킬 행위를 수행한다

즉 스킬 생명주기가 `Ability -> AnimInstance -> Character` 세 층에 흩어져 있다.

그래서 강의가 `AbilityTask`를 말하기 시작하면,
핵심은 "몽타주를 Ability 안으로 끌어오자"는 뜻으로 이해하면 된다.

## `AbilityTask_PlayMontageAndWait`가 필요한 이유

GAS에서 몽타주를 Ability 안으로 끌어오고 싶을 때 자주 쓰는 도구가
`AbilityTask_PlayMontageAndWait`다.

이 태스크를 쓰면 Ability는 아래 사건을 직접 받을 수 있다.

- `OnCompleted`
- `OnInterrupted`
- `OnBlendOut`
- `OnCancelled`

초심자 관점에서 다시 풀면 이 말은 아래와 같다.

- 몽타주가 끝났는지 Ability가 안다
- 중간에 끊겼는지 Ability가 안다
- 따라서 `EndAbility()`나 `CancelAbility()`를 같은 레이어에서 처리할 수 있다
- 쿨다운 적용 시점도 같은 Ability 안에서 맞출 수 있다

즉 `AbilityTask`의 장점은 "몽타주를 재생한다"보다,
`몽타주 생명주기를 Ability 생명주기 안으로 묶는다`에 있다.

## 쿨다운 설계가 함께 등장하는 이유

이번 강의 후반 자막을 보면 `쿨다운 태그`, `Duration`, `SetByCaller`, `GameplayEffectModifierMagnitude` 이야기가 함께 나온다.
이건 우연이 아니다.

현재 코드에도 그 흔적이 남아 있다.

- `GameplayAbility_Base`에 `mCoolDown` 멤버가 있다
- `mCoolDown > 0.f` 분기가 있지만 아직 비어 있다
- `UGameplayEffect_CoolDown` 클래스가 존재하지만 구현은 비어 있다

즉 현재 branch는 아래처럼 읽는 게 맞다.

`마나 소모는 이미 GameplayEffect로 닫혔고, 쿨다운은 태그와 Effect 클래스를 준비해 둔 채 AbilityTask 전환과 함께 채워 넣으려는 단계다.`

왜 함께 가는지 다시 풀면 아래와 같다.

- Ability가 몽타주 완료/취소를 직접 알아야 쿨다운 적용 시점도 안정적으로 잡힌다
- 쿨다운 태그가 붙은 동안 재사용 금지도 Ability 쪽에서 판단하기 쉬워진다
- 스킬 2, 스킬 3처럼 입력 슬롯이 늘수록 이 구조화 이득이 커진다

## 현재 `ShinbiGAS`는 아직 전환 전 구조를 보여 준다

`ShinbiGAS.cpp`를 보면 현재 입력과 스킬 재생은 여전히 캐릭터/애님 쪽에 많이 남아 있다.

- `InputAttack()`은 `mAnimInst->PlayAttack()` 호출
- `Skill1()`은 `mAnimInst->PlaySkill1()` 호출
- `NormalAttack()`만 이벤트를 보내 `GameplayAbility_Attack`을 발동
- `Skill1Casting()`은 여전히 액터 스폰과 디칼 배치를 직접 처리

즉 지금 구조는 `공격 Ability는 GAS`, `스킬 몽타주와 일부 연출은 legacy 애님 구조`가 섞여 있는 과도기 상태다.

그래서 `260424_3`은 "이미 AbilityTask 구조가 들어와 있다"를 설명하는 편이 아니라,
`이제 몽타주와 쿨다운도 GAS 쪽으로 정리해야 하는 이유가 무엇인가`를 설명하는 편으로 읽는 게 더 정확하다.

## 강의에서 가져가면 좋은 설계 감각

이번 편에서 초심자가 가져가면 좋은 감각은 아래 세 가지다.

- `AnimInstance`는 재생 자체에 강하지만, Ability 생명주기 전체를 알지는 못한다
- `AbilityTask`는 재생 결과를 Ability 안으로 되돌려 주므로 비용/취소/완료 처리를 한 레이어로 모을 수 있다
- `CoolDown`은 단순히 태그 하나 추가하는 기능이 아니라, 스킬 재사용 규칙을 Ability 구조 안에 넣는 일이다

즉 `AbilityTask`는 애니메이션 도구가 아니라,
GAS 스킬의 시작과 끝을 정리하는 구조 도구라고 보면 된다.

## 이 편의 핵심 정리

이 편에서 꼭 기억할 문장은 아래다.

`260424 기준 UE20252는 아직 AnimInstance 중심 몽타주 구조를 사용하고 있지만, 강의의 핵심은 마나와 쿨다운을 공통 Ability 베이스로 정리한 뒤 다음 단계에서 몽타주 생명주기도 AbilityTask로 옮기려는 설계 방향을 확정하는 데 있다.`

즉 이번 편은 `AbilityTask API 사용법`을 외우는 편이 아니라,
`왜 지금 구조를 다음 구조로 바꿔야 하는가`를 이해하는 편이다.
