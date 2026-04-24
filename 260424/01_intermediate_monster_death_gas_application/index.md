---
title: 260424 중급 1편 - MonsterGAS 죽음 처리와 AttributeSet 콜백 설계
---

# 중급 1편. MonsterGAS 죽음 처리와 AttributeSet 콜백 설계

[이전: 260423 고급 1편](../../260423/03_advanced_monster_attack_gas_application/) | [허브](../) | [다음: 중급 2편](../02_intermediate_custom_abilitysystemcomponent_and_mana_cost/)

## 이 편의 목표

이 편에서는 `GameplayEffect_Damage`로 HP를 깎는 구조가 이미 들어온 상태에서,
`MonsterGAS`의 실제 죽음 처리 진입점을 어디에 두는 게 맞는지 다시 정리한다.

핵심은 아래 다섯 조각을 한 번에 연결해서 보는 것이다.

- `BaseAttributeSet::PostGameplayEffectExecute()`
- `MonsterAttributeSet`과 `PlayerAttributeSet` 분기 필요성
- `MonsterGAS::Death()`와 `EndPlay()`
- `MonsterGASAnimInstance::AnimNotify_Death()`
- 기존 `TakeDamage()` 코드와 현재 GAS 구조의 차이

즉 이번 편은 "HP가 줄었다"와 "액터가 죽었다"를 같은 함수에 섞지 않고,
GAS 후처리와 액터 후반 정리 레이어를 어떻게 나눌지 설명하는 편이다.

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterAttributeSet.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterAttributeSet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGASAnimInstance.cpp`

## 전체 흐름 한 줄

`DamageSpec 적용 -> AttributeSet 후처리에서 HP 감소 감지 -> 몬스터/플레이어별 죽음 콜백 분기 -> Death()에서 Ragdoll 처리 -> EndPlay()에서 ItemBox 스폰`

## 왜 `PostGameplayEffectExecute()`가 중요해졌는가

`260423`까지 오면 데미지는 더 이상 `TakeDamage()`가 직접 책임지는 구조가 아니다.
공격 Ability가 `GameplayEffect_Damage`를 적용하면,
실제 HP 감소는 `AttributeSet` 후처리에서 관찰하게 된다.

현재 `UBaseAttributeSet` 구현은 아래처럼 아주 얇다.

```cpp
void UBaseAttributeSet::PostGameplayEffectExecute(
    const FGameplayEffectModCallbackData& Data)
{
    if (Data.EvaluatedData.Attribute == GetMPAttribute())
    {
    }
    else if (Data.EvaluatedData.Attribute == GetHPAttribute())
    {
        UE_LOG(UELOG, Warning, TEXT("HP : %.2f / %.2f"), GetHP(), GetHPMax());
    }
}
```

지금은 로그만 찍는다.
하지만 강의에서 강조하는 포인트는 바로 이 위치가
"HP가 0이 되었는지 가장 정확하게 감지할 수 있는 지점"이라는 점이다.

즉 `260424_1`의 핵심 질문은 이것이다.

`HP가 0이 된 사실은 AttributeSet이 제일 먼저 안다. 그렇다면 죽음 처리는 여기서 바로 끝내야 할까?`

답은 `아니다` 쪽에 가깝다.
왜냐하면 사망 후처리는 몬스터와 플레이어가 서로 다르기 때문이다.

## `BaseAttributeSet` 하나로는 죽음 처리를 끝낼 수 없다

현재 `UBaseAttributeSet`은 플레이어와 몬스터가 함께 쓰는 공통 기반이다.

- 플레이어는 사망 시 UI, 입력, 리스폰, 연출 규칙이 필요할 수 있다
- 몬스터는 AI 정지, Ragdoll, LifeSpan, ItemBox 드롭이 필요하다

즉 `HP <= 0`을 감지하는 공통 지점은 `BaseAttributeSet`이 맞지만,
그 다음에 어떤 액터별 후처리를 할지는 파생 AttributeSet이나 Actor 쪽으로 넘기는 게 더 자연스럽다.

강의에서 `MonsterAttributeSet`, `PlayerAttributeSet` 쪽으로 콜백을 분리하려는 이유도 여기에 있다.

초심자 관점에서 다시 쓰면 아래 구조를 목표로 삼는 셈이다.

1. 공통 기반 `BaseAttributeSet`이 HP 감소를 받는다.
2. 여기서 "죽음 조건이 충족됐는가"를 검사한다.
3. 실제 후속 처리 함수는 플레이어용/몬스터용으로 나눠 호출한다.

즉 `BaseAttributeSet`은 "사망 판정 감지기"에 가깝고,
`MonsterAttributeSet`은 "몬스터 죽음 진입점"을 담당하게 하려는 설계다.

## 현재 branch는 어디까지 와 있는가

여기서 중요한 건 강의 방향과 현재 코드 상태를 같이 보는 것이다.

현재 branch에서는 아래가 이미 구현되어 있다.

- `MonsterGAS`는 `UAbilitySystemComponent`와 `UMonsterAttributeSet`을 가진다
- `GameplayAbility_Attack`은 `GameplayEffect_Damage`를 통해 HP를 깎는다
- `MonsterGAS::Death()`는 Ragdoll과 LifeSpan을 처리한다
- `MonsterGAS::EndPlay()`는 `AItemBox`를 스폰한다
- `MonsterGASAnimInstance::AnimNotify_Death()`는 `Death()`를 호출한다

반대로 아직 덜 닫힌 부분도 있다.

- `MonsterAttributeSet.cpp`는 사실상 비어 있다
- `BaseAttributeSet::PostGameplayEffectExecute()`는 로그만 찍고 끝난다
- `MonsterGAS::TakeDamage()`의 예전 HP 차감 코드는 대부분 주석 처리되어 있다

즉 현재 코드는 아래처럼 읽는 게 맞다.

`사망 후반 처리(Death / EndPlay)는 준비되어 있지만, GAS HP 감소와 그 후반 처리를 연결하는 진입점은 아직 강의에서 설계 중이다.`

## `MonsterGAS` 쪽 후반 파이프라인은 이미 준비되어 있다

현재 `MonsterGAS.cpp`를 보면 후반 처리 자체는 꽤 명확하다.

```cpp
void AMonsterGAS::Death()
{
    mMesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
    mMesh->SetCollisionProfileName(TEXT("Ragdoll"));
    mMesh->SetSimulatePhysics(true);
    mMesh->SetAllBodiesBelowSimulatePhysics(TEXT("pelvis"), true, true);
    mMesh->WakeAllRigidBodies();
    mMesh->bBlendPhysics = true;
    SetLifeSpan(3.f);
}
```

그리고 `EndPlay()`에서는 `AItemBox`를 스폰한다.

```cpp
void AMonsterGAS::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    Super::EndPlay(EndPlayReason);

    AItemBox* ItemBox = GetWorld()->SpawnActor<AItemBox>(
        GetActorLocation(), GetActorRotation(), param);
}
```

즉 "죽은 뒤 무엇을 할 것인가"는 이미 구현되어 있다.
문제는 `어디서 죽음 처리를 시작할 것인가`다.

## 현재 진입점은 아직 `AnimNotify_Death()` 쪽이 더 가깝다

`MonsterGASAnimInstance.cpp`를 보면 현재 죽음 모션 쪽 노티파이는 아래처럼 단순하다.

```cpp
void UMonsterGASAnimInstance::AnimNotify_Death()
{
    TObjectPtr<AMonsterGAS> Monster = Cast<AMonsterGAS>(TryGetPawnOwner());
    Monster->Death();
}
```

이 구조는 나쁘지 않다.
오히려 `죽음 모션 끝 -> Ragdoll 전환` 같은 후반 연출에는 잘 맞는다.

하지만 HP가 0이 된 사실을 감지하는 위치로는 부족하다.
그래서 강의는 아래처럼 레이어를 나누려는 방향으로 이해하면 된다.

- `AttributeSet`: HP가 0인지 감지
- `Actor`: AI 정지, 충돌 제거, 사망 상태 진입
- `AnimNotify_Death`: 최종 Ragdoll 전환 같은 모션 타이밍 맞추기

즉 `AnimNotify_Death()`는 "죽었는지 판정하는 함수"가 아니라,
`이미 죽음 상태에 들어간 뒤 실제 물리 전환을 맞추는 함수`로 보는 편이 더 자연스럽다.

## 강의가 실제로 보강하려는 지점

이번 편의 실질적인 설계 포인트는 아래 두 문장으로 압축된다.

- HP 감소 감지는 `PostGameplayEffectExecute()` 같은 GAS 후처리에서 받는다.
- 몬스터/플레이어별 실제 사망 진입은 공통 `BaseAttributeSet`이 아니라 각자 파생 쪽으로 넘긴다.

이걸 현재 branch 관점에서 다시 쓰면,
`BaseAttributeSet -> MonsterAttributeSet -> MonsterGAS::Death()` 사이에 아직 비어 있는 연결 다리를 만드는 작업이라고 보면 된다.

## 이 편의 핵심 정리

이 편에서 꼭 기억할 문장은 아래다.

`260424 기준 UE20252의 사망 후반 파이프라인은 이미 MonsterGAS::Death()와 EndPlay()에 준비되어 있고, 강의의 핵심은 그 파이프라인의 진입점을 AttributeSet 후처리 쪽으로 옮기는 설계를 잡는 데 있다.`

즉 이번 편은 `죽음 기능을 새로 만드는 날`이라기보다,
`이미 있는 사망 후반 처리와 GAS HP 감소를 어디서 연결할지 확정하는 날`이다.
