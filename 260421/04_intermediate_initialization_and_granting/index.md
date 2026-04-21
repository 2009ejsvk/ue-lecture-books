---
title: 260421 중급 2편 - 초기화와 Ability 지급
---

# 중급 2편. 초기화와 Ability 지급

[이전: 중급 1편](../03_intermediate_attributes_and_effects/) | [허브](../) | [다음: 고급 1편](../05_advanced_firegun_and_damage_pipeline/)

## 이 편의 목표

이 편에서는 `GDCharacterBase.cpp`를 기준으로, 캐릭터가 처음 시작할 때 스탯과 Ability를 어디서 받는지 정리한다.

처음 GAS를 배우면 아래 질문이 자주 나온다.

- 시작 HP는 어디서 들어가나
- 패시브 효과는 어디서 들어가나
- 점프나 총쏘기 Ability는 언제 주나

이 편은 그 질문에 답하는 장이다.

## 봐야 할 파일

- `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\GDCharacterBase.cpp`

## 핵심 함수 세 개

- `InitializeAttributes()`
- `AddStartupEffects()`
- `AddCharacterAbilities()`

이 셋은 역할이 다르다.

### `InitializeAttributes()`

시작 스탯을 넣는다.
이 예제는 `DefaultAttributes`라는 GameplayEffect를 자기 자신에게 적용한다.

```cpp
// DefaultAttributes GameplayEffect의 Spec을 만든다.
FGameplayEffectSpecHandle NewHandle =
    AbilitySystemComponent->MakeOutgoingSpec(DefaultAttributes, GetCharacterLevel(), EffectContext);

// 만든 Spec을 자기 자신에게 적용해서 시작 스탯을 세팅한다.
AbilitySystemComponent->ApplyGameplayEffectSpecToTarget(
    *NewHandle.Data.Get(), AbilitySystemComponent.Get());
```

즉 이 예제는 “처음 시작하는 스탯”도 가능하면 GameplayEffect로 넣는 방식을 택한다.

### `AddStartupEffects()`

처음부터 깔고 시작하는 Effect를 넣는다.
예를 들면 패시브 버프, 시작 재생 효과, 직업 기본 상태 같은 것들이 여기에 올 수 있다.

### `AddCharacterAbilities()`

캐릭터가 사용할 Ability들을 `GiveAbility()`로 지급한다.
즉 점프, 총쏘기, 스킬1 같은 “행동 권한”을 여기서 준다.

## `InitializeAttributes()`가 중요한 이유

우리가 대화에서 이야기했던 `Init` 방식과 비교하면 차이가 더 분명해진다.

- `InitHealth(100)`
  값 직접 입력
- `DefaultAttributes GameplayEffect 적용`
  시스템 규칙으로 시작값 생성

이 예제는 후자를 선택한다.
즉 시작값조차 GAS 규칙 안에 넣어 관리하려는 구조다.

이 방식의 장점은 다음과 같다.

- 시작 스탯도 Effect 흐름 안에 들어간다
- 레벨, 클래스, 패시브에 따라 확장하기 쉽다
- 나중에 리스폰이나 재초기화 때 재사용하기 쉽다

## `AddCharacterAbilities()`는 서버에서만 한다

```cpp
// 서버가 아니거나, ASC가 없거나, 이미 한 번 지급했다면 종료한다.
if (GetLocalRole() != ROLE_Authority || !AbilitySystemComponent.IsValid() || AbilitySystemComponent->bCharacterAbilitiesGiven)
{
    return;
}
```

이 코드는 Ability 지급이 서버 책임이라는 걸 보여 준다.
AbilitySpec은 서버가 만들고, 필요한 정보가 클라이언트로 복제된다.

즉 입문 단계에서 이해할 포인트는 아래와 같다.

- Ability 클래스는 미리 준비한다
- 캐릭터가 스폰되면 서버가 `GiveAbility()` 한다
- 입력과 실제 사용은 그 뒤에 연결된다

## `AbilityInputID`와 입력 슬롯

`GiveAbility()`에서 `FGameplayAbilitySpec`을 만들 때,
이 예제는 `AbilityInputID`를 같이 넣는다.

즉 “이 Ability는 어떤 입력 슬롯에 묶이는가”를 여기서 같이 설정하는 구조다.

이 덕분에 나중에 ASC가 입력을 받을 때, 어떤 Ability를 자동 실행할지 연결할 수 있다.

## 왜 `SetHealth`, `SetMana`, `SetStamina`도 남겨 두나

같은 파일 아래를 보면 직접 값을 넣는 Setter도 있다.
하지만 주석은 아주 분명하다.

`리스폰 같은 특수 상황에만 쓰고, 평소에는 GameplayEffect를 써라`

즉 원칙은 아래처럼 정리된다.

- 평소 전투 중 변화
  GameplayEffect
- 강제 초기화, 리스폰, 예외 처리
  직접 Set

이 구분이 중요한 이유는, 전투 중에 전부 직접 `Set`으로 바꾸면 GAS를 쓰는 장점이 많이 줄어들기 때문이다.

## 초심자용 코드 읽기

아래는 `GDCharacterBase.cpp`의 시작 초기화 핵심 부분을 초심자용으로 다시 주석 단 코드다.

```cpp
void AGDCharacterBase::AddCharacterAbilities()
{
    // Ability 지급은 서버만 한다.
    // 이미 지급한 적이 있으면 중복으로 다시 주지 않는다.
    if (GetLocalRole() != ROLE_Authority ||
        !AbilitySystemComponent.IsValid() ||
        AbilitySystemComponent->bCharacterAbilitiesGiven)
    {
        return;
    }

    for (TSubclassOf<UGDGameplayAbility>& StartupAbility : CharacterAbilities)
    {
        AbilitySystemComponent->GiveAbility(
            FGameplayAbilitySpec(
                StartupAbility,
                // 이 Ability의 레벨
                GetAbilityLevel(StartupAbility.GetDefaultObject()->AbilityID),
                // 어떤 입력 슬롯에 연결되는지
                static_cast<int32>(StartupAbility.GetDefaultObject()->AbilityInputID),
                // 소스 오브젝트
                this));
    }

    AbilitySystemComponent->bCharacterAbilitiesGiven = true;
}
```

이 함수는 “캐릭터가 어떤 행동을 할 수 있는가”를 넣는 단계다.
즉 점프, 총쏘기, 스킬1 같은 Ability를 여기서 지급한다.

시작 스탯은 다른 함수가 맡는다.

```cpp
void AGDCharacterBase::InitializeAttributes()
{
    if (!AbilitySystemComponent.IsValid())
    {
        return;
    }

    if (!DefaultAttributes)
    {
        return;
    }

    // 이 Effect가 어디서 왔는지 알려 주는 컨텍스트를 만든다.
    FGameplayEffectContextHandle EffectContext = AbilitySystemComponent->MakeEffectContext();
    EffectContext.AddSourceObject(this);

    // DefaultAttributes라는 GameplayEffect의 Spec을 만든다.
    FGameplayEffectSpecHandle NewHandle =
        AbilitySystemComponent->MakeOutgoingSpec(DefaultAttributes, GetCharacterLevel(), EffectContext);

    if (NewHandle.IsValid())
    {
        // 자기 자신에게 적용해서 시작 스탯을 세팅한다.
        AbilitySystemComponent->ApplyGameplayEffectSpecToTarget(
            *NewHandle.Data.Get(),
            AbilitySystemComponent.Get());
    }
}
```

이 코드가 의미하는 바는 분명하다.

- 이 예제는 시작 스탯도 Effect로 넣는다
- 즉 “초기값 세팅”을 GAS 규칙 안으로 넣는다

시작 효과도 같은 방식이다.

```cpp
void AGDCharacterBase::AddStartupEffects()
{
    if (GetLocalRole() != ROLE_Authority ||
        !AbilitySystemComponent.IsValid() ||
        AbilitySystemComponent->bStartupEffectsApplied)
    {
        return;
    }

    FGameplayEffectContextHandle EffectContext = AbilitySystemComponent->MakeEffectContext();
    EffectContext.AddSourceObject(this);

    for (TSubclassOf<UGameplayEffect> GameplayEffect : StartupEffects)
    {
        FGameplayEffectSpecHandle NewHandle =
            AbilitySystemComponent->MakeOutgoingSpec(GameplayEffect, GetCharacterLevel(), EffectContext);

        if (NewHandle.IsValid())
        {
            AbilitySystemComponent->ApplyGameplayEffectSpecToTarget(
                *NewHandle.Data.Get(),
                AbilitySystemComponent.Get());
        }
    }

    AbilitySystemComponent->bStartupEffectsApplied = true;
}
```

즉 초기화는 셋으로 나뉜다.

- `InitializeAttributes()`
  시작 스탯
- `AddStartupEffects()`
  시작 버프/패시브
- `AddCharacterAbilities()`
  시작 Ability 지급

## 이 편의 핵심 정리

`InitializeAttributes`는 시작 스탯, `AddStartupEffects`는 시작 효과, `AddCharacterAbilities`는 시작 Ability 지급이다.

이 세 함수를 구분할 수 있으면, “캐릭터가 게임에 들어올 때 GAS가 어떻게 채워지는지”가 거의 보이기 시작한다.

## 공식 문서 연결

- [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine)
  Epic 문서는 `GiveAbility`와 `GiveAbilityAndActivateOnce`가 ASC에 Ability를 부여하는 대표 함수이며, `Ability를 주고 빼는 일은 서버가 담당한다`고 설명한다. 이 예제의 `AddCharacterAbilities()`와 정확히 연결된다.

- [Understanding the Unreal Engine Gameplay Ability System](https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-the-unreal-engine-gameplay-ability-system)
  공식 문서는 Attribute와 Effect가 ASC에 부착되어 상호작용한다고 설명한다. 그래서 이 예제처럼 시작 스탯을 `DefaultAttributes GameplayEffect`로 넣는 구조가 GAS 철학에 잘 맞는다.

- [Gameplay Attributes and Gameplay Effects (UE 4.27)](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-attributes-and-gameplay-effects?application_version=4.27)
  개념 참고용으로 보면, Attribute Set을 ASC에 등록하는 방식과 GameplayEffect로 값을 바꾸는 발상이 왜 필요한지 더 선명하게 보인다.

## 다음 편

[고급 1편. FireGun과 데미지 파이프라인](../05_advanced_firegun_and_damage_pipeline/)
