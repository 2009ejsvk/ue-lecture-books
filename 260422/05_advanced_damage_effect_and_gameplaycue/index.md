---
title: 260422 고급 2편 - Damage GameplayEffect와 GameplayCue로 실제 피해를 적용하는 흐름
---

# 고급 2편. Damage GameplayEffect와 GameplayCue로 실제 피해를 적용하는 흐름

[이전: 고급 1편](../04_advanced_targetdata_and_damage_preview/) | [허브](../)

## 이 편의 목표

이 편에서는 `UGameplayAbility_Attack`가 준비해 둔 `HitData`, `TargetASC`, `SourceAttr`를 실제 데미지 적용으로 어떻게 마무리하는지 본다.
핵심은 "공격력 계산", "데미지용 GameplayEffect", "타겟 적용", "GameplayCue 반응"을 분리해서 읽는 것이다.

즉 이번 편은 `260422`의 마지막 빈칸이던 `// Damage 이펙트 발동.`이 실제로 어떤 의미였는지 채우는 편이다.

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Attack.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_Damage.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Cue\Static\GameplayCueNotify_StaticBase.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Cue\Static\GameplayCueNotify_StaticBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGameplayTags.ini`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGame.ini`
- `D:\UnrealProjects\UE_Academy_Stduy\Content\GAS\Cue\BPGCN_ShareDamage.uasset`

## 전체 흐름 한 줄

`HitData -> TargetActor / TargetASC 확보 -> EffectContext에 HitResult 기록 -> Damage GameplayEffectSpec 생성 -> SetByCaller(Effect.Battle.Damage) 주입 -> ApplyGameplayEffectSpecToTarget -> HP 감소 -> PostGameplayEffectExecute -> GameplayCue.Battle.Attack`

## 현재 프로젝트는 ExecutionCalculation 없이 Ability 안에서 바로 계산한다

`260421`의 `FireGun` 예제는 `ExecutionCalculation`까지 가는 정석형 구조였다.
반면 현재 `UE20252`는 더 단순하다.
이번 편의 장점은 그래서 오히려 명확하다.
데미지 계산이 어디서 일어나는지 한눈에 보인다.

```cpp
// 공격자와 피격자의 수치를 직접 읽는다.
float Attack = SourceAttr->GetAttack();
float Defense = TargetAttr->GetDefense();

// 현재 프로젝트의 데미지 공식은 단순하다.
float Damage = Attack - Defense;
Damage = FMath::Max(1.f, Damage);
```

즉 현재 구조는 아래처럼 읽으면 된다.

- `SourceAttr`
  공격자 스탯 저장소
- `TargetAttr`
  피격자 스탯 저장소
- `Attack - Defense`
  이번 프로젝트가 택한 최소형 데미지 공식
- `Max(1.f, Damage)`
  방어력이 높아도 최소 1은 들어가게 하는 하한선

이 방식은 정석 예제보다 덜 일반화돼 있지만, GAS 첫 실전편으로는 오히려 좋다.
왜냐하면 "데미지 값은 결국 어디선가 계산되어 Effect에 들어간다"는 핵심이 더 직접적으로 보이기 때문이다.

## `GameplayEffect_Damage`는 HP를 직접 깎는 규칙 원본이다

계산된 숫자를 바로 `SetHP()`로 넣지 않는 이유는, 이번 프로젝트도 여전히 GAS 규칙을 지키고 있기 때문이다.
값을 바꾸는 최종 수단은 `GameplayEffect`다.

```cpp
// 이 Effect는 HP를 바꾸는 규칙이다.
Modifier.Attribute = UBaseAttributeSet::GetHPAttribute();
Modifier.ModifierOp = EGameplayModOp::Additive;

// 실제 숫자는 런타임에 넣는다.
FSetByCallerFloat Caller;
Caller.DataTag = FGameplayTag::RequestGameplayTag(TEXT("Effect.Battle.Damage"));

Modifier.ModifierMagnitude = FGameplayEffectModifierMagnitude(Caller);
Modifiers.Add(Modifier);
```

이 코드를 초보자 관점에서 풀면 아래와 같다.

- `GetHPAttribute()`
  이번 Effect가 건드릴 대상은 HP다
- `Additive`
  결국 더하기 규칙으로 처리한다
- `Effect.Battle.Damage`
  "이번 공격 피해량을 넣을 슬롯 이름"이다

그래서 실제 Ability 쪽에서는 음수값을 넣는다.

```cpp
DamageSpec.Data->SetSetByCallerMagnitude(
    FGameplayTag::RequestGameplayTag(TEXT("Effect.Battle.Damage")),
    -Damage);
```

즉 현재 프로젝트는 아래 방식으로 HP를 줄인다.

- Effect는 `HP`를 `Additive`로 바꾼다
- Ability는 `-Damage`를 넣는다
- 결과적으로 HP가 감소한다

이 구조는 앞 편에서 본 `ManaCost`와 완전히 같은 철학이다.
다만 대상이 `Self`가 아니라 `Target`으로 바뀌었을 뿐이다.

## `EffectContext`는 이번 공격의 부가 정보를 싣는 상자다

데미지 숫자만 있으면 HP 감소는 가능하다.
하지만 "어디를 맞았는지", "어떤 히트 결과였는지" 같은 문맥까지 남겨 두려면 별도 상자가 필요하다.
그게 `FGameplayEffectContextHandle`이다.

```cpp
FGameplayEffectContextHandle Context = MakeEffectContext(Handle, ActorInfo);
Context.AddHitResult(HitData->HitResult);

FGameplayEffectSpecHandle DamageSpec = MakeOutgoingGameplayEffectSpec(
    UGameplayEffect_Damage::StaticClass(), GetAbilityLevel());

DamageSpec.Data->SetContext(Context);
```

지금 구현에서는 이 컨텍스트를 길게 해석하지 않는다.
그렇지만 구조적으로는 매우 중요한 준비다.

- 나중에 피격 위치 기반 이펙트를 붙일 수 있다
- 맞은 부위나 표면 정보를 더 읽을 수 있다
- 실행 계산 클래스로 확장해도 문맥을 유지할 수 있다

즉 현재 프로젝트는 단순 계산 구조를 택했지만, 문맥 상자는 미리 준비해 둔 셈이다.

## 왜 `TargetData_ActorArray`를 다시 만들어 `ApplyGameplayEffectSpecToTarget()`에 넘기나

여기서 처음 GAS를 읽는 사람은 한 번 더 헷갈리기 쉽다.
이미 `TargetActor`를 알고 있는데, 왜 다시 `TargetData`를 만들까?

현재 구현은 GAS의 표준 적용 경로를 그대로 따르기 위해 이 단계를 둔다.

```cpp
FGameplayAbilityTargetDataHandle TargetData;

FGameplayAbilityTargetData_ActorArray* TargetArray =
    new FGameplayAbilityTargetData_ActorArray;

TargetArray->TargetActorArray.Add(TargetActor);
TargetData.Add(TargetArray);

ApplyGameplayEffectSpecToTarget(
    Handle, ActorInfo, ActivationInfo, DamageSpec, TargetData);
```

즉 이 프로젝트는 "대상이 하나뿐이라 단축해도 되는데도" 굳이 GAS가 이해하는 TargetData 경로를 유지한다.
이 선택 덕분에 나중에 다중 대상, 범위 공격, 연쇄 공격으로 넓히기가 쉬워진다.

지금 단계에서 기억하면 좋은 건 아래다.

- `TargetActor`
  월드의 실제 피격 대상
- `TargetData`
  GAS가 대상을 전달받는 표준 형식
- `ApplyGameplayEffectSpecToTarget`
  데미지 Effect를 상대에게 적용하는 실행 지점

## `PostGameplayEffectExecute()`는 숫자 적용 뒤 후속 반응을 받을 준비를 한다

앞 편에서 봤던 `PostGameplayEffectExecute()`는 여기서 다시 중요해진다.
왜냐하면 이제 실제로 HP가 바뀌기 때문이다.

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

현재 구현은 아직 아주 얇다.
HP가 변하면 로그만 찍고 끝난다.
그렇지만 이 빈 공간이 의미하는 바는 분명하다.

- 여기서 HP clamp를 넣을 수 있다
- 여기서 사망 판정을 넣을 수 있다
- 여기서 UI 갱신, 피격 숫자, 상태이상 반응도 묶을 수 있다

즉 `260422`는 "데미지를 줬다"에서 멈추지 않고, 그 뒤 반응을 어디서 받아야 하는지도 이미 정해 두고 있다.

## `GameplayCue.Battle.Attack`은 수치와 연출을 분리해 준다

현재 프로젝트가 좋은 이유는 데미지 숫자와 타격 연출도 분리해 놓았다는 점이다.
그 연결은 `GameplayEffect_Damage` 안에서 시작된다.

```cpp
FGameplayEffectCue Cue;
Cue.GameplayCueTags.AddTag(FGameplayTag::RequestGameplayTag(
    TEXT("GameplayCue.Battle.Attack")));

GameplayCues.Add(Cue);
```

즉 이 데미지 Effect가 성공적으로 적용되면, 같은 흐름 안에서 `GameplayCue.Battle.Attack`도 따라간다.
그 Cue를 실제로 처리하는 기반 클래스가 `UGameplayCueNotify_StaticBase`다.

```cpp
bool UGameplayCueNotify_StaticBase::OnExecute_Implementation(
    AActor* Target,
    const FGameplayCueParameters& Parameters) const
{
    if (IsValid(mParticle))
    {
        UGameplayStatics::SpawnEmitterAtLocation(
            GetWorld(), mParticle, Target->GetActorLocation());
    }

    if (IsValid(mNiagara))
    {
        UNiagaraFunctionLibrary::SpawnSystemAtLocation(
            GetWorld(), mNiagara, Target->GetActorLocation());
    }

    if (IsValid(mSound))
    {
        UGameplayStatics::SpawnSoundAtLocation(
            GetWorld(), mSound, Target->GetActorLocation());
    }

    return true;
}
```

이 구조의 핵심은 아래 한 문장으로 정리된다.

`HP 감소는 GameplayEffect가 맡고, 눈에 보이는 타격 반응은 GameplayCue가 맡는다.`

즉 수치 시스템과 연출 시스템이 같은 타이밍에 움직이되, 같은 함수에 뒤엉키지는 않는다.

## 태그와 설정 파일이 없으면 이 파이프라인은 완성되지 않는다

이 구조는 코드만으로 끝나지 않는다.
태그와 Cue 탐색 경로도 같이 맞아야 한다.

`DefaultGameplayTags.ini`에는 실제로 아래 태그들이 등록돼 있다.

```ini
+GameplayTagList=(Tag="Ability.Attack",DevComment="")
+GameplayTagList=(Tag="Effect.Battle.Damage",DevComment="")
+GameplayTagList=(Tag="Effect.Mana",DevComment="")
+GameplayTagList=(Tag="GameplayCue.Battle.Attack",DevComment="")
```

그리고 `DefaultGame.ini`에는 Cue 자산을 찾는 경로가 들어 있다.

```ini
+GameplayCueNotifyPaths=/Game/GAS/Cue/
```

즉 이 프로젝트는 아래 세 층이 같이 맞아야 한다.

- 태그 등록
  `Ability.Attack`, `Effect.Battle.Damage`, `GameplayCue.Battle.Attack`
- 코드 연결
  Ability와 GameplayEffect가 같은 태그 이름을 쓴다
- 자산 위치
  `Content/GAS/Cue/` 아래 Cue 자산을 둔다

실제로 현재 프로젝트에는 `D:\UnrealProjects\UE_Academy_Stduy\Content\GAS\Cue\BPGCN_ShareDamage.uasset`가 존재한다.
즉 타격 Cue를 받을 실제 에셋 자리도 마련돼 있다.

## `260421` 정석 예제와 비교하면, 현재 프로젝트가 단순한 대신 구조가 더 바로 보인다

`260421`의 정석형 고급 편은 아래 흐름이었다.

- Ability가 Spec을 만든다
- `ExecutionCalculation`이 방어력/배수를 계산한다
- 메타 Attribute를 거쳐 최종 HP 감소로 간다

현재 `260422` 실전 코드는 더 짧다.

- Ability가 직접 `Attack - Defense`를 계산한다
- `GameplayEffect_Damage`에 `SetByCaller`로 음수값을 넣는다
- 타겟에게 적용한다
- `PostGameplayEffectExecute()`와 `GameplayCue`가 뒤를 잇는다

즉 현재 프로젝트는 덜 일반화돼 있지만, 초심자에게는 오히려 다음 감각을 더 빠르게 준다.

- "데미지 수치"와 "Effect 적용"은 다르다
- "타겟 찾기"와 "타겟 HP 변경"은 다르다
- "숫자 감소"와 "타격 이펙트"도 다르다

이 분리를 잡고 나면, 나중에 `ExecutionCalculation`이나 `Damage Meta Attribute`를 붙여도 훨씬 덜 어렵다.

## 현재 구현을 읽으며 같이 떠올리면 좋은 다음 확장 포인트

이제 구조는 보인다.
그 다음에 확장할 수 있는 지점도 자연스럽게 보인다.

1. 데미지 계산을 Ability 밖으로 빼 `ExecutionCalculation`로 옮길 수 있다.
2. `PostGameplayEffectExecute()`에 HP clamp와 사망 처리까지 넣을 수 있다.
3. `EffectContext` 안의 `HitResult`를 더 활용해 부위별 반응이나 위치 기반 이펙트를 만들 수 있다.
4. `GameplayCueNotify_StaticBase`를 상속한 자산별 Cue를 늘려 플레이어/몬스터/속성별 타격 연출을 나눌 수 있다.

즉 이번 편은 끝이면서 동시에 다음 리팩터링 지점을 보여 주는 편이기도 하다.

## 이 편의 핵심 정리

이 편에서 꼭 기억할 문장은 아래다.

`현재 UE20252의 데미지 파이프라인은 Ability가 계산한 값을 Damage GameplayEffect에 넣고, 그 Effect를 타겟에게 적용한 뒤, PostGameplayEffectExecute와 GameplayCue로 숫자와 연출을 마무리하는 구조다.`

즉 `260422`는 더 이상 "마나 비용을 어떻게 깎을까"에서 멈추지 않는다.
이제는 실제로 상대 HP를 줄이고, 그 타이밍에 타격 반응까지 붙는 GAS 실전 흐름으로 이어진다.
