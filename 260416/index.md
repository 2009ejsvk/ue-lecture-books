---
title: 260416 몬스터 전투 AI 루프
---

# 260416 몬스터 전투 AI 루프

## 문서 개요

이 문서는 `260416_1_Monster AnimInstance`, `260416_2_Monster Trace Task`, `260416_3_Monster Attack Task`를 하나의 전투 AI 교재로 다시 엮은 것이다.
중심 흐름은 `상태 enum -> Trace 태스크 -> Attack 태스크 -> AnimNotify -> 데미지 처리`다.

전날 강의가 몬스터를 필드에 세우고 추적 가능한 상태까지 만드는 과정이었다면, 이번 강의는 그 위에 전투 루프를 얹는 과정이다.
특히 이번 날짜에서 중요한 점은 공격 자체보다도 “어떤 상태를 언제 전환할 것인가”를 명확하게 구조화한다는 데 있다.

그래서 이 교재는 다음 질문에 답하는 방식으로 읽는 것이 좋다.

- 몬스터는 어떤 언어로 자신의 상태를 애니메이션 쪽에 전달하는가
- Trace 태스크는 왜 성공이 아니라 실패를 이용해 다음 단계로 넘어가는가
- 공격은 왜 곧바로 데미지를 주지 않고 노티파이 시점까지 기다리는가

## 학습 목표

- `EMonsterNormalAnim`과 `MonsterAnimInstance`의 관계를 설명할 수 있다.
- `BTTask_MonsterTrace`의 시작, 갱신, 종료 흐름을 말할 수 있다.
- `AttackTarget`, `AttackEnd`, `AnimNotify`가 각각 무엇을 담당하는지 구분할 수 있다.
- 전투 AI를 디버깅할 때 애니메이션, 블랙보드, 태스크 반환값을 어떤 순서로 봐야 하는지 정리할 수 있다.

## 강의 흐름 요약

1. 공용 상태 enum과 AnimInstance를 정의해 몬스터 애니메이션 언어를 만든다.
2. Trace 태스크가 `MoveToActor`와 `Run` 전환을 시작하고, 공격 거리 진입 시 `Failed`로 다음 단계에 넘긴다.
3. Attack 태스크가 `AttackTarget`과 `AttackEnd`를 통해 공격 문맥과 종료 신호를 나눠 관리한다.
4. AnimNotify가 실제 타격 프레임과 공격 종료 시점을 알려 준다.

---

## 제1장. MonsterAnimInstance: 상태를 애니메이션 언어로 번역하기

### 1.1 왜 입력 기반이 아니라 상태 기반인가

일반 몬스터는 플레이어 캐릭터와 요구 사항이 다르다.
플레이어는 이동 입력, 점프 입력, 조준, 속도 변화 등 복잡한 입력 해석이 필요하지만, 일반 몬스터는 대체로 `Idle`, `Walk`, `Run`, `Attack`, `Death` 정도의 상태로도 충분히 설득력 있는 전이를 만들 수 있다.

강의는 이 차이를 정확히 짚는다.
즉 몬스터는 입력을 흉내 내기보다 이미 결정된 상태를 애니메이션 시스템에 전달하는 편이 구조상 더 간단하고 유지보수도 쉽다.

이 관점은 이후 Trace와 Attack 태스크를 읽을 때도 중요하다.
태스크는 “애니메이션을 계산하는 곳”이 아니라, “현재 상태가 무엇인지 선언하는 곳”이 되기 때문이다.

### 1.2 공용 enum이 상태의 기준점이 된다

이번 강의의 가장 중요한 출발점은 `EMonsterNormalAnim`이다.
이 enum은 C++ 로직과 Anim Blueprint가 동시에 읽는 공용 상태 집합이다.

```cpp
UENUM(BlueprintType)
enum class EMonsterNormalAnim : uint8
{
    Idle,
    Walk,
    Run,
    Attack,
    Death
};
```

이 enum이 중요한 이유는 상태 정의가 한 곳에 모인다는 데 있다.
Trace 태스크가 `Run`을 선언하고, Attack 태스크가 `Attack`을 선언하고, 죽음 처리 쪽이 `Death`를 선언하더라도 결국 모두 같은 언어를 쓴다.

즉 전투 AI 전체가 상태 전환이라는 공통 문장으로 묶인다.

### 1.3 MonsterAnimInstance는 계산자가 아니라 저장소다

강의가 좋은 이유 중 하나는 Anim Blueprint를 과도하게 똑똑하게 만들지 않는다는 점이다.
`MonsterAnimInstance`는 복잡한 계산을 하지 않고, 그저 현재 상태를 들고 있는 슬롯 역할에 집중한다.

```cpp
EMonsterNormalAnim mAnimType;

void SetAnim(EMonsterNormalAnim Anim)
{
    mAnimType = Anim;
}
```

이 구조는 매우 단순하지만, 바로 그 단순함 때문에 강하다.
AI 쪽은 `SetAnim()`만 호출하면 되고, Anim Blueprint는 `mAnimType`만 읽으면 된다.
즉 의사결정과 표현이 서로 얽히지 않는다.

### 1.4 종족별 차이는 에셋 연결에서만 만든다

전사형 몬스터, 총잡이형 몬스터처럼 외형과 애니메이션은 달라도 공통 구조는 유지할 수 있다.
강의는 생성자 단계에서 서로 다른 Anim Blueprint만 연결하고, 상태 구조 자체는 동일하게 유지하는 방식을 택한다.

이 선택은 두 가지 장점을 준다.

- 행동 로직은 공통화하고 외형 연출만 분리할 수 있다.
- 새로운 몬스터 종족이 추가되어도 태스크 구조를 다시 짜지 않아도 된다.

![AnimInstance 생성 및 연결 장면](./assets/images/ch1-animinstance-create.jpg)

### 1.5 장 정리

제1장의 결론은 애니메이션 시스템을 단순한 소비자로 두는 데 있다.
상태를 계산하는 곳은 AI 쪽이고, 애니메이션은 그 상태를 표현한다.
이 역할 분리가 명확해질수록 이후 Trace와 Attack 태스크도 읽기 쉬워진다.

---

## 제2장. MonsterTrace: 실패를 이용해 다음 단계로 넘어가기

### 2.1 Trace 태스크를 읽는 올바른 관점

두 번째 강의의 핵심은 기본 `Move To` 노드를 그대로 쓰지 않고, C++ 태스크를 직접 상속해 추적의 시작과 종료 조건을 설계하는 데 있다.
여기서 가장 중요한 오해는 “추적이 성공하면 성공을 반환해야 한다”는 생각이다.

현재 트리 구조에서는 그 반대가 더 자연스럽다.
Trace 태스크의 목적은 공격 거리 안에 들어왔음을 확인하고, 그 시점에서 다음 Attack 태스크가 열리게 만드는 것이다.
즉 이 노드는 추적의 완성이 아니라 공격 단계로 넘어가기 위한 전이 장치다.

### 2.2 태스크 수명주기를 나눠 읽어야 한다

강의는 `ExecuteTask`, `TickTask`, `OnTaskFinished`를 각각 분리해서 이해하도록 만든다.
이 점이 상당히 중요하다.

- `ExecuteTask`: 추적 시작
- `TickTask`: 거리와 상태 감시
- `OnTaskFinished`: 종료 후 정리

이렇게 나눠 보면 추적은 한 번 호출하고 끝나는 기능이 아니라, 일정 시간 동안 계속 감시해야 하는 장기 작업이라는 점이 드러난다.

```cpp
UBTTask_MonsterTrace::UBTTask_MonsterTrace()
{
    NodeName = TEXT("MonsterTrace");
    bNotifyTick = true;
    bNotifyTaskFinished = true;
}
```

이 초기 설정 자체가 이미 태스크의 성격을 말해 준다.

### 2.3 MoveToActor와 Run 전환은 같은 문장이다

Trace 태스크의 시작 시점에는 두 가지가 동시에 일어난다.
목표를 향해 길찾기를 시작하고, 동시에 몬스터의 시각 상태를 `Run`으로 바꾼다.

```cpp
EPathFollowingRequestResult::Type MoveResult = AIController->MoveToActor(Target);
if (MoveResult == EPathFollowingRequestResult::Failed)
    return EBTNodeResult::Failed;

Monster->ChangeAnim(EMonsterNormalAnim::Run);
return EBTNodeResult::InProgress;
```

이 구조 덕분에 추적이 시작되는 순간 플레이어도 몬스터의 의도를 시각적으로 알아차릴 수 있다.
즉 길찾기와 애니메이션은 별개의 기능이 아니라 같은 사건의 두 표현이다.

### 2.4 공격 거리 진입이 왜 실패인가

이번 강의의 가장 중요한 포인트는 여기다.
공격 거리 안에 들어오면 Trace 태스크는 `Succeeded`가 아니라 `Failed`를 반환한다.

처음 보면 이상해 보인다.
하지만 현재 Behavior Tree가 Selector 구조라는 점을 고려하면 오히려 이쪽이 더 자연스럽다.

- Trace가 계속 유효하면 아직 공격 단계가 아니다.
- 공격 거리 안에 들어왔다는 것은 Trace의 역할이 끝났다는 뜻이다.
- 따라서 현재 브랜치를 실패시켜 다음 Attack 태스크가 열리게 한다.

즉 여기서 `Failed`는 오류가 아니라 전이 규칙이다.
이 점을 이해하면 Behavior Tree 반환값을 훨씬 덜 기계적으로 보게 된다.

![MoveToActor 코드와 런타임 추적](./assets/images/ch2-movetoactor-code.jpg)

### 2.5 추적 디버깅에서 자주 놓치는 부분

Trace가 제대로 동작하지 않을 때는 단순히 `MoveToActor()`만 보면 부족하다.
다음 항목을 같이 봐야 한다.

- Target이 실제로 Blackboard에 들어왔는가
- `MoveToActor()`가 `Failed`를 즉시 반환하는가
- 추적 도중 공격 거리 판정이 너무 빨리 걸리는가
- `bUseControllerRotationYaw = true`가 회전 반영에 영향을 주고 있는가

강의가 좋은 점은 반환값을 “성공/실패”라는 표면적 의미로만 다루지 않고, 트리 안에서 다음 행동을 여는 규칙으로 설명한다는 데 있다.

### 2.6 장 정리

제2장의 결론은 Trace 태스크를 추적 기능이 아니라 상태 전이 장치로 읽는 데 있다.
이 관점을 가지면 `Failed`는 더 이상 버그가 아니라, 다음 행동을 의도적으로 여는 문이 된다.

---

## 제3장. MonsterAttack: 공격 노티파이와 블랙보드로 루프를 닫기

### 3.1 공격 태스크는 데미지 함수가 아니다

세 번째 강의는 Attack 태스크를 만든다.
여기서 가장 먼저 정리해야 할 오해는 Attack 태스크가 곧바로 데미지를 주는 함수가 아니라는 점이다.

실제로 Attack 태스크의 첫 역할은 공격 문맥을 세팅하는 것이다.

- 애니메이션을 `Attack` 상태로 바꾼다.
- 현재 공격 대상을 `AttackTarget`으로 저장한다.
- 공격 종료 여부는 `AttackEnd`로 따로 관리한다.

즉 공격은 하나의 함수 호출이 아니라, 짧은 상태기계로 읽는 편이 맞다.

```cpp
Monster->ChangeAnim(EMonsterNormalAnim::Attack);
BlackboardComp->SetValueAsObject(TEXT("AttackTarget"), Target);
return EBTNodeResult::InProgress;
```

이 코드의 핵심은 데미지가 아니라 문맥 저장이다.

### 3.2 왜 Target과 AttackTarget을 나누는가

강의에서 아주 좋은 설계 포인트는 `Target`과 `AttackTarget`을 분리하는 부분이다.
처음에는 같은 대상을 가리키는데 왜 굳이 이름을 나누는지 의문이 생길 수 있다.

하지만 역할이 다르다.

- `Target`: 추적과 인식의 기준
- `AttackTarget`: 실제 타격 대상

이렇게 나누면 추적 중의 목표와 공격 시점의 실제 타격 대상을 나중에 더 유연하게 다룰 수 있다.
특히 원거리 공격, 범위 공격, 스킬 캐스팅으로 확장할 때 이 분리가 매우 유리하다.

### 3.3 AnimNotify가 타격 시점과 종료 시점을 나눈다

강의의 실전성이 가장 잘 드러나는 부분은 노티파이 처리다.
공격 모션이 시작됐다고 즉시 데미지를 주는 것이 아니라, 실제 타격 프레임에서만 `AnimNotify_Attack()`이 호출되고, 공격 애니메이션이 완전히 끝난 뒤에 `AnimNotify_AttackEnd()`가 호출된다.

```cpp
void UMonsterAnimInstance::AnimNotify_Attack()
{
    Monster->NormalAttack();
}

void UMonsterAnimInstance::AnimNotify_AttackEnd()
{
    AIController->GetBlackboardComponent()->SetValueAsBool(TEXT("AttackEnd"), true);
}
```

이 분리 덕분에 다음 두 가지를 동시에 만족할 수 있다.

- 타격은 애니메이션 타이밍에 맞게 일어난다.
- 태스크 종료는 별도 종료 신호를 기준으로 안정적으로 판단할 수 있다.

![공격 노티파이 타임라인](./assets/images/ch3-notify-timeline.jpg)

### 3.4 공격 종료 후에만 재추적 여부를 판단하는 이유

공격 중간에 거리가 조금 멀어졌다고 곧바로 Trace로 돌아가면 몬스터가 흔들려 보인다.
그래서 Attack 태스크는 공격이 완전히 끝났다는 신호를 받은 뒤에만 거리를 다시 계산하고, 계속 싸울지 다시 쫓을지를 결정한다.

이 판단은 전투 연출 측면에서 매우 중요하다.
모션이 끝나기도 전에 다음 상태로 튀지 않으므로, 공격 루프가 훨씬 안정적으로 보인다.

강의는 이 부분을 “종료 후 재추적 여부 판정”으로 설명하지만, 더 넓게 보면 애니메이션 시간과 AI 상태 전이 시간을 일치시키는 작업이라고 볼 수 있다.

### 3.5 실제 데미지는 누가 주는가

Attack 태스크가 문맥을 세팅하고, AnimNotify가 타이밍을 알려준다면, 실제 타격 행위는 몬스터 클래스가 수행한다.
즉 역할은 이렇게 분리된다.

1. 태스크: 공격 상태 시작
2. 노티파이: 실제 타이밍 전달
3. 몬스터 클래스: 데미지 적용

이 설계는 유지보수 측면에서도 좋다.
태스크는 AI 흐름만 책임지고, 데미지 규칙은 몬스터 클래스 쪽에서 개별적으로 다룰 수 있기 때문이다.

### 3.6 장 정리

제3장의 결론은 공격 루프를 “데미지 한 번 주는 기능”으로 보지 않는 데 있다.
공격은 대상 저장, 애니메이션 전환, 노티파이, 종료 신호, 재추적 판정이 묶인 작은 상태기계다.

이 관점을 이해하면 이후 원거리 몬스터나 보스 패턴 확장도 같은 틀 안에서 설계할 수 있다.

---

## 전체 정리

260416 강의는 몬스터 전투 AI가 어떻게 “상태 중심 구조”로 안정화되는지를 보여 준다.
핵심은 다음과 같다.

1. `EMonsterNormalAnim`이 공용 상태 언어를 만든다.
2. `MonsterAnimInstance`가 그 상태를 저장하고 표현한다.
3. Trace 태스크가 추적과 공격 진입의 경계를 관리한다.
4. Attack 태스크가 공격 문맥과 종료 신호를 관리한다.
5. AnimNotify가 실제 타격 시점과 루프 종료 시점을 분리한다.

즉 전투 AI의 완성은 화려한 기능을 많이 붙이는 것이 아니라, 상태와 시점을 정확히 나누는 데 있다.

## 복습 체크리스트

- `EMonsterNormalAnim`이 왜 공용 언어 역할을 하는지 설명할 수 있는가
- Trace 태스크의 `Failed`가 왜 오류가 아니라 전이 규칙인지 설명할 수 있는가
- `AttackTarget`과 `AttackEnd`를 분리한 이유를 말할 수 있는가
- AnimNotify가 타격 시점과 종료 시점을 나눠 주는 장점을 설명할 수 있는가
- 공격 중 재추적 여부를 즉시 판단하지 않고 종료 후 판단하는 이유를 설명할 수 있는가

## 세미나 질문

1. Trace 태스크가 현재 Selector 구조가 아니라 Sequence 구조 아래에 있다면 반환값 설계는 어떻게 달라져야 하는가.
2. `AttackTarget`과 `Target`을 분리한 구조는 원거리 몬스터나 범위 공격으로 갈 때 어떤 장점을 주는가.
3. 몬스터 애니메이션 상태를 enum 기반으로 유지하는 방식은 보스 몬스터에도 그대로 적용할 수 있는가.
4. Attack 태스크 종료 후 회전 보정만 하고 재추적은 잠시 미루는 설계가 필요한 경우는 어떤 상황인가.

## 권장 과제

1. `MonsterNormal_MinionGunner` 기준으로 원거리 공격 버전을 설계하고, 어떤 블랙보드 키가 추가로 필요할지 정리한다.
2. Trace 태스크가 `Succeeded`를 반환하도록 바꿨을 때 트리 실행 흐름이 어떻게 달라지는지 기록한다.
3. `AttackEnd` 대신 Montage 종료 이벤트를 쓰는 대안이 있는지 조사하고 장단점을 비교한다.
4. 다음 확장 과제로 “피격 반응 상태”를 추가한다면 enum, 태스크, 노티파이 중 어디를 어떻게 바꾸는 것이 가장 적절한지 설계안을 써 본다.
