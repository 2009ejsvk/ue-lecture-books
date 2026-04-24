---
title: 260422 초급 1편 - 이벤트 공격이 Ability로 들어오는 흐름
---

# 초급 1편. 이벤트 공격이 Ability로 들어오는 흐름

[허브](../) | [다음: 중급 1편](../02_intermediate_manacost_effect_and_setbycaller/)

## 이 편의 목표

이 편에서는 `ShinbiGAS`에서 만든 공격 이벤트가 `UGameplayAbility_Attack`로 들어와, 결국 `SourceActor`, `SourceASC`, `SourceAttr`를 확보하는 과정까지를 본다.
즉 “공격 버튼을 눌렀다”가 GAS 세계에서는 어떤 데이터 흐름으로 바뀌는지 잡는 것이 목표다.

처음 읽을 때는 타입 이름을 다 외울 필요 없다.
이 편에서는 아래 세 가지만 잡아도 충분하다.

- `FGameplayEventData`
  공격 정보를 담아 보내는 이벤트 상자
- `SourceASC`
  이 공격을 쓰는 쪽의 GAS 본체
- `SourceAttr`
  그 GAS 본체가 들고 있는 수치 저장소

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\ShinbiGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Attack.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\PlayerCharacterGAS.h`

## 전체 흐름 한 줄

`공격 입력 -> 공격 정보를 이벤트 상자에 담음 -> 공격 Ability 호출 -> 내 ASC 찾기 -> 내 AttributeSet 찾기`

코드 이름으로 다시 쓰면 아래 흐름이다.

`NormalAttack() -> FGameplayEventData 작성 -> Ability.Attack 태그 전송 -> UGameplayAbility_Attack 발동 -> SourceActor / SourceASC / SourceAttr 확보`

## `ShinbiGAS::NormalAttack()`은 직접 공격하지 않고 이벤트를 보낸다

이 프로젝트에서 공격 입력은 `ShinbiGAS::NormalAttack()`으로 들어온다.
중요한 점은 여기서 곧바로 “데미지 적용”을 하지 않는다는 것이다.
대신 충돌로 얻은 히트 결과를 `FGameplayEventData`에 담아 GAS 쪽으로 보낸다.

```cpp
// GAS에 보낼 "공격 이벤트 상자"를 만든다.
FGameplayEventData EventData;

// 누가 맞았는지 기록한다.
EventData.Target = HitActor;
// 누가 이 이벤트를 만들었는지 기록한다.
EventData.Instigator = this;
// 이 이벤트가 "공격"이라는 뜻의 태그를 붙인다.
EventData.EventTag = FGameplayTag::RequestGameplayTag(TEXT("Ability.Attack"));

// 히트 결과를 GAS 표준 TargetData 형태로 감싼다.
FGameplayAbilityTargetData_SingleTargetHit* TargetData =
    new FGameplayAbilityTargetData_SingleTargetHit(Hit);

// 방금 만든 히트 데이터를 이벤트 상자 안에 넣는다.
EventData.TargetData.Add(TargetData);

// 이벤트를 이 액터에게 보내서, 태그에 연결된 Ability가 시작되게 한다.
UAbilitySystemBlueprintLibrary::SendGameplayEventToActor(
    this,
    EventData.EventTag,
    EventData);
```

이 코드는 아래 정보를 한 번에 담는다.

- 누가 공격했는가
- 누구를 맞췄는가
- 어떤 이벤트인가
- 히트 결과는 무엇인가

즉 공격 판정은 `ShinbiGAS`가 만들고, 실제 Ability 로직은 GAS가 이어받는 구조다.

## 왜 직접 함수 호출 대신 `GameplayEvent`를 쓰나

장점은 분명하다.

- 입력/충돌 생성 쪽과 Ability 실행 쪽이 분리된다
- 나중에 같은 Ability를 다른 이벤트로도 발동시킬 수 있다
- `TargetData` 같은 GAS 표준 데이터 구조를 재사용할 수 있다

즉 `NormalAttack()`는 “공격 시스템 전체”가 아니라, GAS가 이해할 수 있는 이벤트를 만드는 발신자라고 보면 된다.

## `UGameplayAbility_Attack`은 태그로 발동 대상을 예약해 둔다

`UGameplayAbility_Attack` 생성자를 보면 아래처럼 트리거를 등록한다.

```cpp
// "Ability.Attack" 태그가 오면
FAbilityTriggerData TriggerData;

// 이 Ability를 자동으로 깨우겠다고 등록한다.
TriggerData.TriggerTag = FGameplayTag::RequestGameplayTag(TEXT("Ability.Attack"));
TriggerData.TriggerSource = EGameplayAbilityTriggerSource::GameplayEvent;

// 방금 만든 트리거 규칙을 Ability 쪽 목록에 추가한다.
AbilityTriggers.Add(TriggerData);
```

즉 이 Ability는

- `Ability.Attack` 태그가 붙은
- `GameplayEvent`가 들어오면
- 자동으로 발동되도록

미리 연결돼 있다.

그래서 `SendGameplayEventToActor()`로 보낸 이벤트가 바로 이 Ability까지 연결된다.

## `ActivateAbility()`에 들어오면 먼저 Source 쪽을 확보한다

강의에서 첫 번째로 강조하는 건 “이 Ability를 누가 발동시켰는가”다.
그래서 코드도 먼저 소스 액터와 소스 ASC를 가져온다.

```cpp
// 지금 이 Ability를 실제로 쓰고 있는 아바타 액터를 찾는다.
AActor* SourceActor = GetAvatarActorFromActorInfo();
// 그 액터에 연결된 GAS 본체(ASC)를 찾는다.
UAbilitySystemComponent* SourceASC = GetAbilitySystemComponentFromActorInfo();
// ASC가 들고 있는 수치 저장소(AttributeSet)를 읽기 전용으로 꺼낸다.
const UBaseAttributeSet* SourceAttr = SourceASC->GetSet<UBaseAttributeSet>();
```

![`ActivateAbility()`에서 `GetAvatarActorFromActorInfo()`로 SourceActor를 얻는 장면](../assets/images/sourceactor-from-actorinfo.jpg)

각 줄의 의미는 아래와 같다.

- `GetAvatarActorFromActorInfo()`
  이 Ability를 실제로 실행 중인 아바타 액터를 준다
- `GetAbilitySystemComponentFromActorInfo()`
  현재 ActorInfo에 연결된 ASC를 바로 준다
- `GetSet<UBaseAttributeSet>()`
  그 ASC가 들고 있는 `UBaseAttributeSet`을 꺼낸다

즉 “누가 썼는지”, “그 액터의 GAS 본체가 뭔지”, “그 액터의 스탯 저장소가 뭔지”를 차례로 잡는 구조다.

## `PlayerCharacterGAS`는 `IAbilitySystemInterface`를 구현해 둔다

이 흐름이 가능한 이유는 `PlayerCharacterGAS`가 `IAbilitySystemInterface`를 상속받고, ASC를 리턴하는 함수를 구현해 두었기 때문이다.

```cpp
// 이 캐릭터의 ASC가 mASC라는 사실을 엔진과 GAS에 알려 준다.
virtual UAbilitySystemComponent* GetAbilitySystemComponent() const
{
    return mASC;
}
```

![`APlayerCharacterGAS`가 `IAbilitySystemInterface`를 구현하는 장면](../assets/images/playercharactergas-abilitysystem-interface.jpg)

즉 캐릭터는 단순한 비주얼 액터가 아니라, “내 ASC는 여기 있다”라고 엔진과 GAS에 알려 주는 인터페이스 구현체다.

그래서 `ActorInfo`와 `BlueprintLibrary`가 이 액터에서 ASC를 찾아갈 수 있다.

## `GetSet()`이 `const` 포인터를 돌려준다는 점이 첫 번째 걸림돌이다

강의 중간에 빨간 줄이 뜨는 장면이 나오는데, 이유는 `GetSet<UBaseAttributeSet>()`가 `const UBaseAttributeSet*`를 반환하기 때문이다.

즉 아래는 에러가 난다.

```cpp
// 읽기 전용(const)로 반환되는 값을 일반 포인터로 받으려 해서 에러가 난다.
UBaseAttributeSet* SourceAttr = SourceASC->GetSet<UBaseAttributeSet>();
```

![`GetSet()` 반환값을 일반 포인터로 받으려다 const 에러가 나는 장면](../assets/images/sourceattr-const-getset-error.jpg)

반면 아래처럼 읽기 전용으로 받으면 문제없다.

```cpp
// 값을 읽기만 할 거라면 const 포인터로 받으면 된다.
const UBaseAttributeSet* SourceAttr = SourceASC->GetSet<UBaseAttributeSet>();
```

이 차이는 매우 중요하다.

- 값을 읽기만 할 거면 `const` 그대로 가도 된다
- 직접 값을 바꾸려면 `const_cast`를 고민해야 한다
- 하지만 GAS에서는 보통 직접 `Set`하기보다 `GameplayEffect`로 바꾸는 편이 더 자연스럽다

즉 여기서 `const` 문제를 본 이유는 단순 문법이 아니라, “GAS에서는 값 변경을 어디서 해야 하나”라는 철학과 연결되기 때문이다.

## 이 편의 핵심 정리

이 편에서 꼭 기억할 흐름은 아래다.

1. `ShinbiGAS::NormalAttack()`가 히트 결과를 `GameplayEvent`로 만든다
2. `Ability.Attack` 태그가 `UGameplayAbility_Attack`를 발동시킨다
3. Ability 안에서 `SourceActor`, `SourceASC`, `SourceAttr`를 차례로 꺼낸다
4. 그 다음부터 마나 검사와 Effect 적용 같은 실제 GAS 로직이 시작된다

즉 이 편의 결론은 아래 한 문장이다.

`SourceASC는 ActorInfo에서 찾고, SourceAttr은 ASC의 GetSet에서 찾는다.`

## 다음 편

[중급 1편. ManaCost GameplayEffect와 SetByCaller](../02_intermediate_manacost_effect_and_setbycaller/)
