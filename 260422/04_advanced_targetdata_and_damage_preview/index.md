---
title: 260422 고급 1편 - TargetData와 다음 데미지 이펙트 예고
---

# 고급 1편. TargetData와 다음 데미지 이펙트 예고

[이전: 중급 2편](../03_intermediate_spec_apply_and_post_execute/) | [허브](../)

## 이 편의 목표

이 편에서는 `UGameplayAbility_Attack` 안에 이미 심어 둔 `TargetData` 처리 구조를 읽고, 왜 다음 단계가 자연스럽게 “데미지용 GameplayEffect”로 이어지는지 정리한다.
즉 `260422`의 마지막은 마나 비용 적용에서 끝나지만, 실제로는 다음 공격 파이프라인의 절반까지 이미 와 있다는 점을 보여 주는 편이다.

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Attack.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\ShinbiGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.cpp`

## `TargetData`는 이미 이벤트에 담겨 들어온다

앞 문서에서 봤듯이 `ShinbiGAS::NormalAttack()`은 히트 결과를 `FGameplayAbilityTargetData_SingleTargetHit`로 만들어 이벤트에 넣어 둔다.

처음엔 `TargetData = 맞은 대상 기록 묶음` 정도로 읽어도 충분하다.

그래서 `UGameplayAbility_Attack` 쪽에서는 그 데이터를 다시 꺼내면 된다.

```cpp
// 이벤트 안에 들어 있던 "한 대상 히트 결과"를 다시 꺼낸다.
FGameplayAbilityTargetData_SingleTargetHit* HitData =
    (FGameplayAbilityTargetData_SingleTargetHit*)(
        TriggerEventData->TargetData.Data[0].Get());
```

즉 이 Ability는 타겟을 “다시 찾는” 게 아니라, 이미 전달된 히트 결과를 이어받는다.

이 점이 중요하다.

- 충돌 계산은 캐릭터/무기 쪽
- Ability는 받은 히트 데이터를 해석하는 쪽

으로 역할이 나뉘기 때문이다.

## 왜 `TriggerEventData`를 먼저 체크하나

코드 초반에는 아래 같은 방어 코드가 있다.

```cpp
// 이미 Ability가 취소됐거나, 이벤트 데이터가 비어 있으면 더 진행하지 않는다.
if (!mAbilityActive || !TriggerEventData || !TriggerEventData->Target)
{
    EndAbility(Handle, ActorInfo, ActivationInfo, true, false);
    return;
}
```

즉 공격 Ability라도 아래 조건이면 진행하지 않는다.

- 공통 부모에서 이미 취소된 Ability다
- 이벤트 데이터가 비어 있다
- 타겟 자체가 없다

이런 early return은 단순 안전장치가 아니다.
이후 `HitData`, `TargetActor`, `TargetASC`까지 모두 이 데이터에 의존하기 때문에, 초반에 막아 두는 게 맞다.

## `TargetActor`와 `TargetASC`를 분리해서 읽어야 한다

히트 데이터를 얻고 나면, 다음으로 타겟 액터와 타겟 ASC를 확보한다.

```cpp
// 히트 결과에서 월드의 실제 타겟 액터를 얻는다.
AActor* TargetActor = HitData->HitResult.GetActor();

// 그 타겟 액터에 연결된 GAS 본체(ASC)까지 이어서 찾는다.
UAbilitySystemComponent* TargetASC =
    UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(TargetActor);
```

여기서도 역할이 나뉜다.

- `TargetActor`
  월드의 실제 피격 대상
- `TargetASC`
  그 대상의 GAS 본체

즉 데미지 이펙트를 적용할 땐 결국 `TargetASC`가 필요하다.
그래서 `TargetActor`만 찾고 끝나는 게 아니라, GAS 적용 지점까지 이어서 찾아가야 한다.

## 왜 `UAbilitySystemBlueprintLibrary`를 쓰나

이 프로젝트는 `TargetActor`가 반드시 같은 타입 캐릭터라고 보장하지 않는다.
그래서 직접 형변환해서 ASC 멤버를 꺼내기보다, `UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent()`로 한 번 감싸 읽는 편이 안전하다.

장점은 아래와 같다.

- 인터페이스 구현체라면 타입에 덜 묶인다
- 코드가 간결하다
- 나중에 플레이어/몬스터가 섞여도 재사용하기 쉽다

즉 이 줄은 단순 편의 함수가 아니라, GAS 친화적인 조회 방식이다.

## 지금 코드가 비워 둔 자리: `// Damage 이펙트 발동.`

`UGameplayAbility_Attack.cpp` 마지막을 보면 가장 중요한 빈 칸이 하나 있다.

```cpp
// Damage 이펙트 발동.
```

이 주석 한 줄이 곧 다음 강의의 방향을 거의 다 말해 준다.
이미 필요한 재료는 대부분 준비돼 있다.

- 이벤트로 공격 Ability 발동 가능
- SourceASC 확보 가능
- Source AttributeSet 확보 가능
- 마나 비용 적용 가능
- HitData 확보 가능
- TargetASC 확보 가능

이제 남은 건 “타겟에게 어떤 Effect를 어떤 값으로 적용할 것인가”다.

## 다음 데미지 파이프라인은 어떻게 이어질까

현재 구조를 기준으로 다음 단계는 거의 아래 흐름일 가능성이 높다.

1. 공격 Ability 안에서 데미지용 `GameplayEffect` Spec 생성
2. 공격력, 스킬 배수 같은 값을 `SetByCaller` 또는 별도 계산 규칙으로 주입
3. `ApplyGameplayEffectSpecToTarget` 또는 유사 함수로 타겟 ASC에 적용
4. `BaseAttributeSet::PostGameplayEffectExecute()`에서 HP 변경 후처리

즉 마나 비용을 자기 자신에게 적용한 방식이, 다음엔 데미지를 상대에게 적용하는 방식으로 그대로 확장되는 셈이다.

## `260421` 고급 편과 연결해서 보면 더 잘 보인다

`260421`의 `FireGun과 데미지 파이프라인` 문서에서는 `SetByCaller -> ExecutionCalculation -> Damage 메타 Attribute -> PostGameplayEffectExecute`라는 정석형 구조를 설명했다.

반면 `260422`는 그 정석을 그대로 복제하지 않고, 훨씬 단순한 프로젝트 코드 안에 아래 감각을 먼저 심는 단계다.

- 비용도 Effect다
- 값 변경은 Ability 직수정이 아니라 Effect 적용이다
- Source와 Target을 ASC 단위로 생각한다
- 후처리는 AttributeSet이 맡는다

즉 `260422`는 축소판 실전편이다.
개념은 간단하지만, 다음 데미지 이펙트 설계를 받아들이기 위한 골격은 이미 충분히 들어 있다.

## 이 편의 핵심 정리

이 편에서 꼭 기억할 문장은 아래다.

`HitData와 TargetASC까지 이미 확보됐으므로, 다음 단계는 데미지용 GameplayEffect를 타겟에게 적용하는 일만 남아 있다.`

즉 `260422`의 끝은 미완성이 아니라, 다음 공격 시스템 강의로 자연스럽게 이어지는 설계 중간 지점이다.
