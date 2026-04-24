---
title: 260424 중급 2편 - 커스텀 AbilitySystemComponent와 ManaCost 구조 정리
---

# 중급 2편. 커스텀 AbilitySystemComponent와 ManaCost 구조 정리

[이전: 중급 1편](../01_intermediate_monster_death_gas_application/) | [허브](../) | [다음: 고급 1편](../03_advanced_abilitytask_and_montage_ability_playback/)

## 이 편의 목표

이 편에서는 `GameplayAbility_Base`가 현재 어떤 공통 책임을 맡고 있는지 다시 정리하고,
왜 강의에서 `사용자 정의 AbilitySystemComponent` 이야기가 나오는지 맥락을 묶어 본다.

핵심은 아래 다섯 조각을 한 번에 보는 것이다.

- `PlayerCharacterGAS`와 `MonsterGAS`가 `UAbilitySystemComponent`를 만드는 방식
- `GiveAbility()`로 Ability를 등록하는 현재 구조
- `GameplayAbility_Base::ActivateAbility()`의 `mMana`, `mCoolDown`
- `GameplayEffect_ManaCost`의 `SetByCaller`
- 이후 스킬 수가 늘어날 때 공통 Ability와 캐릭터 전용 Ability를 어떻게 정리할 것인가

즉 이번 편은 "마나 소모를 구현했다"에서 끝나는 편이 아니라,
`Ability를 보유/지급/활성화하는 구조를 어디까지 공통화할 것인가`를 설명하는 편이다.

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_ManaCost.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\PlayerCharacterGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\ShinbiGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGameplayTags.ini`

## 전체 흐름 한 줄

`캐릭터가 ASC를 생성하고 Ability를 지급 -> Ability 공통 베이스가 MP를 검사 -> ManaCost GameplayEffectSpec 생성 -> Effect.Mana SetByCaller 주입 -> ApplyGameplayEffectSpecToSelf()`

## 지금 구조는 "캐릭터가 직접 ASC를 들고 Ability를 준다"

현재 `PlayerCharacterGAS`와 `MonsterGAS`는 둘 다 생성자에서 바로 `UAbilitySystemComponent`를 만든다.

```cpp
mASC = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("ASC"));
mAttributeSet = CreateDefaultSubobject<UPlayerAttributeSet>(TEXT("AttributeSet"));
mASC->AddAttributeSetSubobject<UPlayerAttributeSet>(mAttributeSet);
```

몬스터도 거의 같은 구조다.
즉 현재 branch는 아직 `Custom AbilitySystemComponent`가 아니라
`Actor가 직접 기본 ASC를 하나 들고 있는 구조`라고 보면 된다.

그리고 `BeginPlay()`에서 바로 `InitAbilityActorInfo()`와 `GiveAbility()`를 수행한다.

```cpp
mASC->InitAbilityActorInfo(this, this);
mASC->GiveAbility(FGameplayAbilitySpec(UGameplayAbility_Attack::StaticClass(), 1, 0));
```

이 구조는 입문용으로는 충분히 좋다.
하지만 스킬 수가 늘어나면 아래 문제가 생긴다.

- 어떤 Ability가 공용인지 캐릭터 전용인지 구분이 흐려진다
- 입력 슬롯(`InputID`)과 Ability 등록 위치가 흩어진다
- 플레이어/몬스터/영웅별 묶음을 어디서 관리할지 모호해진다

그래서 강의에서 `사용자 정의 AbilitySystemComponent` 이야기가 나오기 시작한다.

## `GameplayAbility_Base`는 이미 공통 Ability 베이스 역할을 하고 있다

현재 공통 Ability 베이스는 `UGameplayAbility_Base`다.

헤더만 봐도 의도가 꽤 분명하다.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Ability")
float mMana;

UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Ability")
float mCoolDown;
```

즉 이 클래스는 "공격 Ability"만의 베이스가 아니라,
앞으로 여러 스킬이 공통으로 가져야 할 비용과 공통 규칙을 담는 기반 클래스다.

`ActivateAbility()` 안을 보면 현재 실제로 닫힌 부분도 확인된다.

- `AvatarActor` 유효성 검사
- `mMana`가 부족하면 `CancelAbility()`
- `GameplayEffect_ManaCost` 스펙 생성
- `Effect.Mana` 태그로 `SetByCaller`
- `ApplyGameplayEffectSpecToSelf()`

```cpp
if (mMana > 0.f)
{
    if (SourceAttr && SourceAttr->GetMP() < mMana)
    {
        CancelAbility(Handle, ActorInfo, ActivationInfo, true);
        return;
    }
}

FGameplayEffectSpecHandle ManaSpec = MakeOutgoingGameplayEffectSpec(
    UGameplayEffect_ManaCost::StaticClass(), GetAbilityLevel());

ManaSpec.Data->SetSetByCallerMagnitude(
    FGameplayTag::RequestGameplayTag(TEXT("Effect.Mana")), -mMana);

SourceASC->ApplyGameplayEffectSpecToSelf(*ManaSpec.Data);
```

즉 현재 branch는 이미 `마나 검증 + 마나 소모`를 Ability 공통 베이스로 밀어 넣기 시작한 상태다.

## `GameplayEffect_ManaCost`는 비용 자체를 들고 있지 않는다

`UGameplayEffect_ManaCost` 구현을 보면 비용 숫자를 고정하지 않는다.
대신 `Effect.Mana` 태그 슬롯을 하나 준비해 두고,
실제 값은 Ability가 넣도록 설계되어 있다.

```cpp
Caller.DataTag = FGameplayTag::RequestGameplayTag(TEXT("Effect.Mana"));
Modifier.ModifierMagnitude = FGameplayEffectModifierMagnitude(Caller);
Modifiers.Add(Modifier);
```

이 구조가 중요한 이유는 아래와 같다.

- Skill1, Skill2, 궁극기마다 비용이 달라도 같은 Effect 클래스를 재사용할 수 있다
- 비용 계산 책임은 Ability에 두고, Attribute 수정 책임은 Effect에 둘 수 있다
- 나중에 커스텀 ASC가 Ability를 묶어 관리해도 비용 규칙은 계속 재사용할 수 있다

즉 이번 편에서 `ManaCost`는 단순한 MP 감소 기능이 아니라,
공통 Ability 구조를 만들 때 어떻게 "규칙"을 분리하는지를 보여 주는 예제다.

## 왜 `Custom AbilitySystemComponent` 이야기가 자연스럽게 나오는가

자막 흐름을 보면 이번 강의는 단순히 `mASC`를 상속한 새 클래스를 만들자는 얘기에서 끝나지 않는다.
오히려 아래 질문으로 이어진다.

- 공용 Ability는 어디에 모을 것인가
- Shinbi 전용 Ability는 어디에 둘 것인가
- 입력 슬롯 번호와 Ability 지급 위치를 어디서 관리할 것인가

초심자 관점에서 다시 풀면,
`Custom ASC`는 "기능 추가용 컴포넌트"라기보다 `Ability 보관함과 지급 관리자`에 가깝다.

예를 들어 아래처럼 역할을 나눌 수 있다.

- `GameplayAbility_Base`
  마나/쿨다운/공통 규칙
- `Custom AbilitySystemComponent`
  공용 Ability와 영웅 전용 Ability 등록 정책
- `Character`
  어떤 시점에 어떤 묶음을 활성화할지 결정

즉 강의가 보여 주는 방향은
`Ability 로직`, `Ability 보유/등록`, `입력 바인딩`을 한곳에 몰아넣지 말자는 쪽이다.

## 현재 branch는 아직 전환 중이다

여기서 중요한 건 현재 코드와 강의 방향의 차이를 같이 읽는 것이다.

현재 branch에서는 아직 아래가 남아 있다.

- `UserAbilitySystemComponent` 같은 커스텀 ASC 클래스가 없다
- `InputID`를 ASC 내부에서 체계적으로 처리하는 구조가 없다
- `mCoolDown > 0.f` 분기는 비어 있다
- `UGameplayEffect_CoolDown`은 빈 껍데기에 가깝다

즉 `260424_2`는 "이미 다 구현된 커스텀 ASC를 설명하는 날"이 아니라,
`현재 Ability 공통 베이스를 여기까지 만들었으니 이제 등록 구조를 분리할 시점`을 보여 주는 날에 더 가깝다.

## `ShinbiGAS`가 보여 주는 현재 한계

`ShinbiGAS.cpp`를 보면 현재 공격과 스킬 일부는 여전히 캐릭터 클래스와 애님 인스턴스에 많이 걸려 있다.

- `InputAttack()`은 `mAnimInst->PlayAttack()`을 직접 호출한다
- `Skill1()`은 `mAnimInst->PlaySkill1()`을 직접 호출한다
- `NormalAttack()`은 이벤트를 보내 `Ability.Attack`을 호출하지만, 전체 입력 구조는 아직 분산돼 있다

즉 Ability 자체는 GAS로 들어오기 시작했지만,
Ability 지급과 입력 문맥은 아직 캐릭터/애님 쪽에 많이 남아 있다.

그래서 강의는 `Custom ASC`를 통해 아래를 정리하려는 방향으로 읽는 게 자연스럽다.

- 어떤 Ability가 어떤 슬롯을 쓰는가
- 어떤 Ability가 공용이고 어떤 Ability가 영웅 전용인가
- BeginPlay에서 무조건 다 주는 게 맞는가

## 이 편의 핵심 정리

이 편에서 꼭 기억할 문장은 아래다.

`260424 기준 UE20252의 GAS 공통 베이스는 이미 ManaCost 구조까지는 닫혀 있고, 강의의 핵심은 이제 Ability 자체보다도 Ability를 보유하고 지급하는 ASC 구조를 어떻게 정리할 것인가로 이동하고 있다는 점이다.`

즉 이번 편은 `마나 소모 구현`을 복습하는 날이면서 동시에,
`Skill2`, `CoolDown`, 영웅별 Ability 확장에 대비한 구조 설계`로 넘어가는 문턱이다.
