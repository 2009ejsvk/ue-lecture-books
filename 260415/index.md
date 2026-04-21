---
title: 260415 몬스터 스폰과 순찰 AI 기초
---

# 260415 몬스터 스폰과 순찰 AI 기초

## 문서 개요

이 문서는 `260415_1`부터 `260415_3`까지의 강의를 하나의 연속된 교재로 다시 정리한 것이다.
핵심 주제는 `SpawnPoint -> PatrolPoints -> MonsterController -> Blackboard -> Move To`로 이어지는 기본 몬스터 AI 골격이다.

이번 날짜의 강의는 전투보다 앞단에 있는 준비 과정을 다룬다.
즉 몬스터를 어디에 둘지, 어떤 규칙으로 다시 태어나게 할지, 어떻게 순찰 데이터를 넘길지, 적을 보면 어떤 식으로 추적 상태로 바뀌게 할지를 단계적으로 연결한다.
겉으로 보면 개별 기능을 나눠 배우는 것 같지만, 실제로는 하나의 필드형 몬스터 시스템을 밑바닥부터 조립하는 과정에 가깝다.

이 교재는 다음 세 가지 자료를 함께 대조해 작성했다.

- 강의 자막의 설명 순서
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252` 실제 C++ 소스

## 학습 목표

- `MonsterSpawnPoint`를 왜 별도 액터로 두는지 설명할 수 있다.
- `PatrolPath`와 `PatrolPoints`가 각각 어떤 단계의 데이터인지 구분할 수 있다.
- `PossessedBy`, `OnTarget`, `MoveToLocation`, `MoveToActor`가 어떤 순서로 이어지는지 말할 수 있다.
- Nav Mesh, Team ID, DetectRange, AttackDistance를 포함한 기본 AI 디버깅 순서를 정리할 수 있다.

## 강의 흐름 요약

1. `SpawnPoint` 액터를 만들어 스폰 클래스, 리스폰 시간, 순찰 경로를 한 곳에 모은다.
2. `USplineComponent`를 런타임용 좌표 배열로 번역해 순찰 데이터로 바꾼다.
3. 몬스터가 `PossessedBy` 시점에 Behavior Tree를 연결하고, 컨트롤러는 시야와 팀 설정을 준비한다.
4. 감지 성공 시 `Blackboard.Target`을 갱신하고, `Move To` 기반 추적이 시작된다.

---

## 제1장. SpawnPoint 기초

### 1.1 왜 몬스터를 직접 레벨에 놓지 않는가

첫 강의의 핵심은 몬스터 인스턴스를 레벨에 직접 박아 두는 구조에서 벗어나는 데 있다.
레벨에 바로 배치한 몬스터는 처음에는 간단해 보이지만, 죽은 뒤 다시 나타나는 규칙, 같은 지역에서 다른 종류의 몬스터를 주기적으로 생성하는 규칙, 지역마다 순찰 경로를 다르게 주는 규칙이 붙는 순간 관리 비용이 급격히 올라간다.

그래서 강의는 몬스터 본체보다 먼저 `MonsterSpawnPoint`를 세운다.
이 선택의 의미는 단순히 편해진다는 수준이 아니라, 월드에 배치되는 객체의 책임을 다시 나누는 데 있다.
몬스터는 “태어난 뒤 무엇을 하는가”에 집중하고, SpawnPoint는 “언제 어디서 무엇을 태어나게 할 것인가”를 전담한다.

이렇게 분리하면 같은 몬스터 클래스라도 SpawnPoint 설정만 달리해 전혀 다른 필드 운용 패턴을 만들 수 있다.
특정 지역은 빠른 리스폰을 주고, 다른 지역은 느린 리스폰을 주는 식의 조정도 액터 설정만으로 가능해진다.

### 1.2 편집 도구로서의 Root, Arrow, PatrolPath

SpawnPoint는 논리 클래스이면서 동시에 에디터용 도구다.
`Root`, `Arrow`, `PatrolPath`를 함께 두는 이유는, 디자이너가 월드에서 즉시 방향과 경로를 확인할 수 있게 만들기 위해서다.

- `Root`: 이 액터의 기준 좌표
- `Arrow`: 스폰 방향과 배치 기준 시각화
- `PatrolPath`: 순찰용 입력 경로

즉, 여기서 `PatrolPath`는 최종 실행 데이터가 아니다.
사람이 편하게 편집하기 위한 입력 장치다.
실제 AI가 읽는 것은 이후 장에서 다루는 `PatrolPoints` 배열이다.

![SpawnPoint 루트와 방향, 스플라인 입력](./assets/images/l1-root-arrow-spline.jpg)

### 1.3 스폰 규칙을 변수로 노출하는 이유

강의는 객체 참조가 아니라 `TSubclassOf<AMonsterBase>`를 이용해 생성 대상을 고른다.
이 선택은 상당히 중요하다.
Details 패널에서 안전하게 생성 클래스를 고를 수 있고, 하위 몬스터 타입이 늘어나도 SpawnPoint 쪽 인터페이스는 거의 바뀌지 않는다.

또한 `mSpawnTime` 하나만으로 즉시 리스폰, 지연 리스폰, 느린 필드 리젠 같은 정책을 같은 방식으로 제어할 수 있다.
즉 스폰 규칙이 코드 분기문이 아니라 데이터 설정값으로 내려온다.

![SpawnPoint 프로퍼티 설정 화면](./assets/images/l1-spawn-properties.jpg)

### 1.4 SpawnMonster가 실제로 하는 일

강의만 들으면 SpawnPoint는 “SpawnActor를 부른다” 정도로 보이기 쉽다.
하지만 실제 소스를 보면 `SpawnMonster()`는 그보다 훨씬 많은 문맥을 한 번에 처리한다.

1. 생성할 몬스터 클래스가 유효한지 검사한다.
2. CDO에서 캡슐 높이를 읽어 스폰 위치의 Z를 보정한다.
3. 충돌 처리 방식을 `AdjustIfPossibleButAlwaysSpawn`로 준다.
4. 생성된 몬스터에게 자신의 SpawnPoint와 PatrolPoints를 전달한다.

이 구조 덕분에 스폰 직후의 몬스터는 단순히 “생성된 액터”가 아니라, 이미 필드 문맥을 전달받은 상태가 된다.
강의에서 다음 장으로 넘어갈 수 있는 이유도 바로 여기서 Patrol 데이터가 같이 넘어가기 때문이다.

```cpp
void AMonsterSpawnPoint::SpawnMonster()
{
    if (IsValid(mSpawnClass))
    {
        FVector SpawnLocation = GetActorLocation();
        TObjectPtr<AMonsterBase> CDO = mSpawnClass->GetDefaultObject<AMonsterBase>();

        if (IsValid(CDO))
        {
            TObjectPtr<UCapsuleComponent> Capsule = CDO->GetCapsule();
            SpawnLocation.Z += Capsule->GetScaledCapsuleHalfHeight();
        }

        mSpawnMonster = GetWorld()->SpawnActor<AMonsterBase>(
            mSpawnClass, SpawnLocation, GetActorRotation(), param);

        mSpawnMonster->SetSpawnPoint(this);
        mSpawnMonster->SetPatrolPoints(mPatrolPoints);
    }
}
```

이 코드는 강의의 개념을 실무적으로 완성하는 지점이다.
특히 캡슐 높이 보정은 “바닥에 반쯤 박혀 스폰되는 문제”를 막는 현실적인 디테일이고, `SetSpawnPoint`, `SetPatrolPoints` 호출은 이후 AI 시스템 전체를 이어 주는 연결선이다.

### 1.5 장 정리

제1장의 결론은 명확하다.
몬스터 AI의 첫 단계는 전투 로직이 아니라 배치 규칙의 구조화다.
즉 “어떤 몬스터가 싸우는가”보다 먼저 “어떤 문맥을 가진 채 태어나는가”를 설계해야 이후 순찰과 추적이 매끄럽게 이어진다.

---

## 제2장. SplineComponent와 Behavior Tree 등록

### 2.1 스플라인은 입력이고 순찰점은 실행 데이터다

두 번째 강의는 SpawnPoint에 붙어 있던 `USplineComponent`를 실제 AI가 이해할 수 있는 순찰 좌표로 변환하는 과정에 초점을 둔다.
여기서 핵심은 스플라인 자체를 AI가 쓰지 않는다는 점이다.
스플라인은 편집자 친화적인 입력 장치이고, 실행 시점에는 `TArray<FVector>`가 더 단순하고 직접적이다.

이 구분이 중요한 이유는 다음과 같다.

- 사람은 곡선과 포인트를 보며 경로를 다듬고 싶다.
- AI는 순서대로 읽을 수 있는 월드 좌표 배열만 있으면 된다.
- 입력 형식과 실행 형식을 분리하면 편집 경험과 런타임 단순성을 동시에 챙길 수 있다.

![스플라인 편집 화면](./assets/images/l2-spline-editor.jpg)

실제 소스는 이 번역 과정을 `OnConstruction()`에서 처리한다.
즉 에디터에서 스플라인 점을 수정할 때마다 순찰용 좌표 배열이 갱신된다.
BeginPlay까지 기다리지 않아도 에디터 단계에서 곧바로 결과를 확인할 수 있다는 뜻이다.

```cpp
void AMonsterSpawnPoint::OnConstruction(const FTransform& Transform)
{
    Super::OnConstruction(Transform);

    mPatrolPoints.Empty();
    int32 Count = mPatrolPath->GetNumberOfSplinePoints();

    for (int32 i = 0; i < Count; ++i)
    {
        FVector Point = mPatrolPath->GetLocationAtSplinePoint(
            i, ESplineCoordinateSpace::World);
        mPatrolPoints.Add(Point);
    }
}
```

강의에서 “OnConstruction이 편하다”고 설명한 이유를 코드로 읽으면 훨씬 선명해진다.
이 함수는 런타임 로직보다 편집 경험을 더 좋게 만들기 위한 선택이다.

### 2.2 MonsterBase가 순찰과 전투의 공통 허브가 되는 이유

겉보기에는 SpawnPoint 파트와 Patrol 파트가 따로 놀아 보일 수 있다.
하지만 실제 프로젝트를 읽어 보면 두 장을 이어 주는 중심은 `MonsterBase`다.

`MonsterBase`는 단순한 캐릭터 클래스가 아니라, 이동 속도, 감지 거리, 공격 거리, 순찰 경로, 현재 목표 등 몬스터 행동 전반의 공통 기반을 보관하는 허브다.
즉 순찰을 위한 데이터도 여기서 들고 있고, 나중에 추적과 공격에 필요한 값도 여기서 주입된다.

```cpp
mWalkSpeed = Info->WalkSpeed;
mRunSpeed = Info->RunSpeed;
mDetectRange = Info->DetectRange;
mAttackDistance = Info->AttackDistance;
mGold = Info->Gold;

mMovement->MaxSpeed = mWalkSpeed;

TObjectPtr<AMonsterController> AI = GetController<AMonsterController>();
if (IsValid(AI))
{
    AI->SetDetectRange(mDetectRange);
}
```

이 코드에서 중요한 점은 강의에서 개념적으로 설명한 `DetectRange`, `AttackDistance`, 속도 전환 값이 실제로는 `FMonsterInfo` 데이터에서 주입된다는 사실이다.
즉 Patrol과 Trace가 하드코딩된 튜토리얼 상수가 아니라, 데이터 자산으로부터 공급되는 시스템이 된다.

### 2.3 Behavior Tree 등록 시점은 왜 PossessedBy인가

강의는 몬스터가 어떤 Behavior Tree를 쓸지 정하는 시점으로 `PossessedBy`를 강조한다.
이 선택은 엔진 라이프사이클과 정확히 맞물린다.
컨트롤러가 실제로 폰을 소유한 뒤여야 Blackboard와 Behavior Tree를 준비할 수 있기 때문이다.

```cpp
void AMonsterNormal::PossessedBy(AController* NewController)
{
    AMonsterController* Ctrl = Cast<AMonsterController>(NewController);
    Ctrl->SetAITree(TEXT("/Game/Monster/BT_Monster_Normal.BT_Monster_Normal"));

    Super::PossessedBy(NewController);
}
```

이 코드 자체는 짧다.
하지만 짧은 만큼 더 중요하다.
강의의 포인트는 코드를 길게 쓰는 데 있지 않고, “BT를 언제 연결하는가”를 정확히 이해하는 데 있다.

![PossessedBy에서 AI 트리를 붙이는 장면](./assets/images/l2-possessedby-setup.jpg)

### 2.4 Patrol Task는 왜 Target이 없을 때만 움직이는가

`BTTask_Patrol`의 핵심은 순찰을 “기본 상태”로 본다는 데 있다.
Target이 생기면 곧바로 순찰 우선순위를 내려놓고 전투 브랜치가 다시 평가되게 만든다.

이 설계는 매우 좋다.
순찰은 아무 일도 일어나지 않을 때의 기본 행동이지, 전투 신호와 경쟁하는 최상위 행동이 아니기 때문이다.

강의에서는 이 부분이 동작 원리 수준에서 설명되지만, 코드를 보면 훨씬 또렷하다.

- Blackboard의 `Target`이 있으면 순찰을 계속 밀지 않는다.
- `MoveToLocation()`은 Target이 없을 때만 의미가 있다.
- 목표점에 도달하면 `NextPatrol()`로 다음 웨이포인트로 넘어간다.

결국 Patrol은 “한 번 이동 명령을 던지는 함수”가 아니라, 전투 신호와 도착 판정을 같이 보면서 다음 상태로 넘기는 루프다.

### 2.5 장 정리

제2장은 입력을 행동으로 바꾸는 번역 계층을 설명한다.
스플라인은 사람이 편하게 쓰는 입력 도구이고, PatrolPoints는 AI가 읽는 데이터이며, Behavior Tree는 그 데이터를 언제 어떻게 소비할지를 결정하는 실행 구조다.

즉 이 장의 핵심은 기능 추가가 아니라 계층 분리다.

---

## 제3장. 타겟 인식 및 Move To

### 3.1 감지 이전에 먼저 확인해야 할 것들

세 번째 강의에서 사용자는 흔히 Perception 설정부터 만지기 쉽다.
하지만 실제 프로젝트를 기준으로 보면, 감지가 되기 전에 먼저 확인해야 할 것들이 있다.

1. AIController가 제대로 빙의되었는가
2. `AutoPossessAI`가 `PlacedInWorldOrSpawned`로 설정되어 있는가
3. Monster와 Player의 Team ID가 적대 관계로 맞는가
4. Behavior Tree가 실제로 구동되고 있는가

즉 감지 문제처럼 보이는 증상도 사실은 빙의 시점이나 팀 설정 문제일 수 있다.
강의 후반이 사실상 디버깅 교안처럼 느껴지는 이유도 여기에 있다.

### 3.2 MonsterController는 생성자에서 감각을 준비한다

Perception은 나중에 붙이는 옵션이 아니라, 컨트롤러 생성 시점부터 준비되는 기본 능력이다.
`MonsterController`는 생성자 안에서 시야 감각을 만들고, 감지 반경과 감지 대상을 설정하고, 감지 이벤트를 `OnTarget`에 바인딩한다.

```cpp
mSightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("Sight"));
mSightConfig->SightRadius = 800.f;
mSightConfig->LoseSightRadius = 800.f;
mSightConfig->PeripheralVisionAngleDegrees = 180.f;
mSightConfig->DetectionByAffiliation.bDetectEnemies = true;

mAIPerception->ConfigureSense(*mSightConfig);
mAIPerception->SetDominantSense(mSightConfig->GetSenseImplementation());
SetGenericTeamId(FGenericTeamId(TeamMonster));

mAIPerception->OnTargetPerceptionUpdated.AddDynamic(
    this, &AMonsterController::OnTarget);
```

이렇게 보면 강의에서 말하는 “시야 설정”이 에디터 튜닝이 아니라 코드 레벨 초기화라는 점이 분명해진다.

### 3.3 OnTarget은 감지와 이동 상태를 같이 갱신한다

강의의 핵심 함수는 `OnTarget(AActor*, FAIStimulus)`이다.
이 함수는 감지 성공 여부에 따라 단순히 Target만 넣고 빼는 것이 아니라, 몬스터의 이동 상태도 함께 바꾼다.

- 감지 성공: Blackboard `Target` 채움, `DetectTarget(true)` 호출
- 감지 실패: Blackboard `Target` 비움, `DetectTarget(false)` 호출

즉 감지와 속도 전환이 하나의 함수 안에서 묶인다.
이 구조 덕분에 몬스터는 단순히 목표를 “안다”는 상태를 넘어, 시각적으로도 걷기에서 달리기로 즉시 반응하게 된다.

### 3.4 Move To는 Blackboard 없이는 의미가 없다

강의는 Blackboard와 Behavior Tree를 따로따로 설명하지만, 실제 런타임에서는 거의 한 몸처럼 움직인다.

1. `SetAITree()`가 트리를 로드하고 실행한다.
2. `OnTarget()`이 Blackboard `Target`을 갱신한다.
3. `BTTask_MonsterTrace`가 `Target`을 읽어 `MoveToActor()`를 호출한다.

```cpp
void AMonsterController::SetAITree(const FString& Path)
{
    FSoftObjectPath SoftPath(Path);
    mAITreeLoader = TSoftObjectPtr<UBehaviorTree>(SoftPath);

    if (!mAITreeLoader.IsNull())
    {
        mAITree = mAITreeLoader.LoadSynchronous();
        if (!IsValid(mAITree))
            return;

        if (!RunBehaviorTree(mAITree))
            return;
    }
}
```

결국 `Move To`는 단독 기능이 아니라 Blackboard 상태 위에서만 의미를 가진다.
Target이 없다면 Patrol이나 Wait가 의미를 가지고, Target이 생기는 순간 추적 브랜치가 의미를 가진다.

![Behavior Tree와 추적 브랜치](./assets/images/l3-behavior-tree.jpg)

### 3.5 Move To가 실패할 때 점검할 것

강의 후반부에서 중요한 부분은 “AI가 왜 안 움직이는가”를 하나씩 분해하는 태도다.
실제로는 다음 순서로 보는 것이 가장 효율적이다.

- Controller가 실제로 붙었는가
- Team ID가 적대 판정으로 맞는가
- BT가 실행 중인가
- Blackboard의 `Target`이 채워졌는가
- Nav Mesh Bounds Volume이 충분히 깔렸는가
- 공격 거리와 감지 거리가 너무 촘촘하게 설정되지 않았는가

![Nav Mesh 확인 장면](./assets/images/l3-navmesh.jpg)

`MoveToActor()` 호출만 보고 끝내면 안 된다.
추적 AI는 감지, 팀 판정, Nav Mesh, Blackboard, 거리 기준이 한꺼번에 맞아야 비로소 작동한다.

### 3.6 장 정리

제3장의 결론은 “감지 코드 하나만 맞춘다고 AI가 완성되지는 않는다”는 데 있다.
추적 AI는 다음 요소가 모두 연결될 때에만 동작한다.

- `TeamPlayer`, `TeamMonster`
- `SightRadius`, 감지 이벤트 바인딩
- `RunBehaviorTree`
- Blackboard `Target`
- `MoveToActor`
- 공격 거리 판정

즉 Move To는 최종 결과일 뿐이고, 그 앞에는 이미 상당히 많은 준비가 쌓여 있다.

---

## 전체 정리

260415 강의는 필드형 몬스터 AI의 뼈대를 세우는 날짜다.
핵심은 전투를 화려하게 만드는 것이 아니라, 몬스터가 필드에 배치되고, 경로를 받고, AI 트리를 연결하고, 적을 인식하면 추적으로 넘어가는 최소 구조를 끝까지 완성하는 데 있다.

가장 중요한 연결은 아래와 같다.

1. SpawnPoint가 문맥을 준비한다.
2. MonsterBase가 데이터를 보관한다.
3. MonsterController가 감지와 트리를 준비한다.
4. Blackboard가 현재 목표 상태를 저장한다.
5. Patrol과 Trace 태스크가 상태에 따라 이동 행동을 전환한다.

이 흐름을 이해하면 이후 `260416`의 Attack 루프도 훨씬 쉽게 읽힌다.

## 복습 체크리스트

- SpawnPoint를 별도 액터로 두는 이유를 설명할 수 있는가
- `PatrolPath`와 `PatrolPoints`의 차이를 말할 수 있는가
- `PossessedBy`가 BT 연결 시점으로 적절한 이유를 설명할 수 있는가
- `OnTarget`이 단순 감지 함수가 아니라 상태 전환 함수라는 점을 설명할 수 있는가
- Move To가 안 될 때 Nav Mesh, Team ID, BT 실행 여부를 어떤 순서로 볼지 정리했는가

## 세미나 질문

1. SpawnPoint의 스플라인 변환을 BeginPlay가 아니라 OnConstruction에서 처리한 선택은 협업 관점에서 어떤 장점이 있는가.
2. `MonsterInfoLoadComplete`가 DetectRange와 AttackDistance를 데이터 테이블에서 읽어 오는 구조는 어떤 확장성을 주는가.
3. Patrol에서 Target 유무를 먼저 보는 설계는 Selector 구조를 어떻게 더 읽기 쉽게 만드는가.
4. `Move To` 디버깅 경험을 기준으로 할 때, 컨트롤러와 블랙보드 초기화 로그를 어디에 추가하는 것이 가장 효과적인가.

## 권장 과제

1. SpawnPoint마다 대기 시간이나 리스폰 시간을 다르게 주고 필드 감각이 어떻게 달라지는지 비교한다.
2. `DetectRange`, `AttackDistance`를 서로 다른 몬스터 데이터에 적용해 추적 패턴 차이를 기록한다.
3. Patrol 다음 단계로 `Wait` 태스크를 추가했을 때 BT 구조가 어떻게 읽히는지 정리한다.
4. `260416` 강의를 이어서 읽으며 `Target`과 `AttackTarget`의 차이를 비교한다.
