const bookData = {
  course: {
    code: "UE20252 Lecture Notes / 260415 Module",
    title: "260415 몬스터 AI 대학 강의교재",
    subtitle:
      "SpawnPoint, Patrol, Perception, Behavior Tree, Move To를 강의 자막과 UE20252 실제 프로젝트 소스로 함께 읽는 심화 정리본",
    abstract:
      "이 문서는 `260415_1`부터 `260415_3`까지의 강의를 단순 요약하지 않고, 자막 설명, 장면 캡처, 실제 C++ 프로젝트 구현을 서로 대조해 재구성한 강의교재이다. 따라서 '강의에서 무엇을 설명했는가'와 '프로젝트가 그것을 실제로 어떻게 구현했는가'를 한 페이지 안에서 연속적으로 확인할 수 있다.",
    method: [
      "강의 자막에서 확인되는 설명 흐름을 먼저 정리한다.",
      "해당 구간을 보여 주는 캡처 도판을 붙여 시각적 기억을 남긴다.",
      "`D:\\UnrealProjects\\UE_Academy_Stduy\\Source\\UE20252`의 실제 코드에서 구현 근거를 추출해 장마다 '소스 세미나'로 배치한다.",
    ],
    outcomes: [
      "`SpawnPoint -> PatrolPoints -> MonsterBase -> MonsterController -> Blackboard -> BT Task` 흐름을 실제 코드 단위로 설명할 수 있다.",
      "`OnConstruction`, `PossessedBy`, `OnTarget`, `MoveToLocation`, `MoveToActor`가 각각 어느 단계의 책임을 맡는지 구분할 수 있다.",
      "강의에서 자주 막히는 지점인 팀 판정, Nav Mesh, 감지 범위, 속도 전환을 코드와 런타임 관점에서 점검할 수 있다.",
    ],
    audience: [
      "언리얼 AI를 처음 배우지만 블루프린트와 C++를 함께 보고 싶은 학습자",
      "강의 내용을 따라 했는데 실제 프로젝트 구조와 연결이 흐릿한 수강생",
      "패트롤, 감지, 추적, 공격으로 이어지는 몬스터 AI 골격을 과제 수준으로 정리하려는 사용자",
    ],
    dossier: [
      { label: "원본 강의", value: "260415_1 ~ 260415_3" },
      { label: "프로젝트 소스", value: "UE20252 C++ Source" },
      { label: "분석 경로", value: "자막 · 캡처 · 실제 코드 대조" },
      { label: "학습 축", value: "스폰, 순찰, 감지, 추적, 확장" },
    ],
  },
  roadmap: [
    {
      code: "260415_1",
      title: "SpawnPoint 액터 설계",
      description:
        "레벨에 몬스터를 직접 두지 않고, `mSpawnClass`, `mSpawnTime`, `PatrolPath`를 들고 있는 SpawnPoint 액터를 만든다.",
    },
    {
      code: "260415_2",
      title: "Spline -> PatrolPoints -> BT 등록",
      description:
        "에디터 입력용 스플라인을 AI가 이해하는 `TArray<FVector>`로 변환하고, `PossessedBy`에서 BT를 컨트롤러에 연결한다.",
    },
    {
      code: "260415_3",
      title: "Perception, Blackboard, Move To",
      description:
        "팀 판정, 시야 설정, `OnTarget`, `MoveToActor`를 묶어 추적 가능한 몬스터 AI의 최소 골격을 완성한다.",
    },
    {
      id: "chapter-patrol",
      displayNo: "02",
      chapterNo: "Chapter II",
      code: "260415_2",
      title: "SplineComponent와 BehaviorTree 등록",
      strap:
        "편집용 스플라인을 실제 순찰 좌표로 바꾸고, 몬스터가 사용할 Behavior Tree를 컨트롤러에 등록한다.",
      duration: "Lecture Span 00:00:00 - 00:51:31",
      tags: [
        "MonsterBase.cpp",
        "MonsterNormal.cpp",
        "BTTask_Patrol.cpp",
      ],
      intro:
        "두 번째 강의는 SpawnPoint 내부에 들어 있던 순찰 입력을 실제 AI 행동 구조로 끌어올리는 단계다. 스플라인을 좌표 배열로 바꾸는 것만으로는 충분하지 않고, 몬스터가 그 배열을 들고 있어야 하며, 동시에 어떤 Behavior Tree를 구동할지도 지정되어야 한다. UE20252 소스는 이 세 단계를 `MonsterBase`, `MonsterNormal`, `BTTask_Patrol`로 명확하게 분리한다.",
      thesis:
        "이 장의 명제는 **편집 도구와 실행 트리 사이에는 반드시 번역 계층이 필요하다**는 것이다. Spline은 인간 친화적이고, PatrolPoints는 AI 친화적이며, BT는 판단 친화적이다. 강의는 이 세 층을 차례로 연결한다.",
      learningGoals: [
        "`PatrolPath`와 `PatrolPoints`가 서로 다른 책임을 가진다는 사실을 설명할 수 있다.",
        "`MonsterNormal::PossessedBy`가 BT 등록의 적절한 시점인 이유를 이해할 수 있다.",
        "`BTTask_Patrol`이 Target 유무, MoveToLocation, 도착 판정을 어떻게 처리하는지 읽을 수 있다.",
      ],
      sections: [
        {
          title: "1. 스플라인은 순찰 경로를 편집하는 입력 장치다",
          source: "자막 근거 00:00:33 - 00:08:17",
          body:
            "강의는 스플라인을 복잡한 수학 개념으로 다루지 않고, 점을 찍고 드래그해 경로를 만드는 편집 장치로 설명한다. 이는 매우 중요한 접근이다. 실제 AI는 좌표 배열만 필요하지만, 디자이너는 곡선과 핸들을 직접 보며 작업하는 편이 훨씬 쉽기 때문이다.",
          bullets: [
            "열린 경로와 닫힌 루프를 같은 툴에서 편하게 다룰 수 있다.",
            "순찰 입력을 시각화하면 런타임 디버깅보다 훨씬 앞단에서 오류를 줄일 수 있다.",
            "이 장의 핵심은 '스플라인 자체를 쓰는 법'보다 '스플라인을 AI용 데이터로 번역하는 법'에 있다.",
          ],
        },
        {
          title: "2. MonsterBase는 데이터를 보관하고 AI 파라미터를 주입받는다",
          source: "자막 근거 00:18:16 - 00:23:10, 00:38:38 이후 소스 대조",
          body:
            "실제 프로젝트를 보면 `MonsterInfoLoadComplete`에서 몬스터 데이터가 채워지고, 그 과정에서 `WalkSpeed`, `RunSpeed`, `DetectRange`, `AttackDistance`가 모두 세팅된다. 곧 PatrolPoints뿐 아니라 앞으로의 추적과 공격 거리도 이 계층에 쌓이는 셈이다.",
          bullets: [
            "MonsterBase는 단순 Pawn이 아니라 데이터와 움직임의 허브다.",
            "DetectRange를 AIController로 전달하는 지점이 이 파일 안에 있다.",
            "즉 순찰과 전투의 연결 고리도 사실상 MonsterBase가 들고 있다.",
          ],
        },
        {
          title: "3. BT 등록의 시작점은 PossessedBy다",
          source: "자막 근거 00:38:38 - 00:45:09",
          body:
            "강의는 몬스터가 어떤 Behavior Tree를 쓸지 정하는 시점으로 `PossessedBy`를 설명한다. 실제 코드에서도 `MonsterNormal::PossessedBy`가 컨트롤러를 캐스팅하고 `SetAITree`를 호출한다. 중요한 점은, BT 등록이 몬스터 인스턴스가 실제로 컨트롤러에 빙의된 뒤에 이뤄진다는 것이다.",
          bullets: [
            "이 시점이면 AIController가 실제로 존재하고 Blackboard/BT 초기화가 가능하다.",
            "강의 내용이 추상 개념이 아니라 실제 엔진 라이프사이클과 맞물려 있다.",
            "BT 에셋 경로가 무엇인지, 누가 주는지, 언제 주는지가 여기서 정리된다.",
          ],
        },
        {
          title: "4. Patrol Task는 Target이 없을 때만 유효하다",
          source: "자막 근거 00:34:15 - 00:51:31 + 프로젝트 태스크 대조",
          body:
            "프로젝트의 `BTTask_Patrol`을 보면 순찰 로직은 생각보다 절제되어 있다. Blackboard에 `Target`이 생기면 곧바로 성공 처리해 상위 Selector가 전투 브랜치를 다시 평가하게 만든다. Target이 비어 있을 때만 `MoveToLocation(Monster->GetPatrolPoint())`가 실행된다.",
          bullets: [
            "순찰은 기본 상태이고, Target이 생기는 순간 우선순위를 양보한다.",
            "도착 판정은 단순히 MoveTo 호출 결과가 아니라 거리 계산으로 한 번 더 확인한다.",
            "`NextPatrol()` 호출로 다음 웨이포인트 인덱스를 관리한다.",
          ],
        },
      ],
      sourceStudies: [
        {
          label: "Source Seminar A",
          title: "MonsterInfoLoadComplete는 AI 파라미터를 실제 값으로 채운다",
          file: "Monster/MonsterBase.cpp",
          lines: "175-224",
          summary:
            "강의에서는 DetectRange와 속도 전환이 개념적으로 설명되지만, 실제 프로젝트에서는 그 값이 데이터 테이블 기반 `FMonsterInfo`에서 들어온다. `MonsterInfoLoadComplete`가 바로 그 주입 지점이다.",
          thesis:
            "즉 Patrol과 Trace는 하드코딩된 상수가 아니라 데이터 자산으로 조정 가능한 시스템으로 설계되어 있다. 대학 과제 수준에서 한 단계 올라간 포인트가 바로 여기에 있다.",
          snippet: `mWalkSpeed = Info->WalkSpeed;
mRunSpeed = Info->RunSpeed;
mDetectRange = Info->DetectRange;
mAttackDistance = Info->AttackDistance;
mGold = Info->Gold;

mMovement->MaxSpeed = mWalkSpeed;

TObjectPtr<AMonsterController> AI = GetController<AMonsterController>();
if (IsValid(AI))
{
    AI->SetDetectRange(mDetectRange);
}`,
        },
        {
          label: "Source Seminar B",
          title: "PossessedBy에서 BT를 연결한다",
          file: "Monster/MonsterNormal.cpp",
          lines: "27-35",
          summary:
            "강의 후반의 '몬스터가 빙의되는 시점에 BT를 등록한다'는 설명이 실제 프로젝트에서는 매우 짧고 명확한 코드로 나타난다. 바로 `PossessedBy` 안에서 `SetAITree`를 호출하는 구조다.",
          thesis:
            "중요한 것은 코드 길이가 아니라 시점이다. AI 라이프사이클을 어느 시점에 끊어 이해할 것인가가 이 장의 핵심이다.",
          snippet: `void AMonsterNormal::PossessedBy(AController* NewController)
{
    UE_LOG(UELOG, Warning, TEXT("Monster PossessedBy"));

    AMonsterController* Ctrl = Cast<AMonsterController>(NewController);
    Ctrl->SetAITree(TEXT("/Game/Monster/BT_Monster_Normal.BT_Monster_Normal"));

    Super::PossessedBy(NewController);
}`,
        },
        {
          label: "Source Seminar C",
          title: "Patrol Task는 Target이 없을 때만 MoveToLocation을 호출한다",
          file: "Monster/BTTask_Patrol.cpp",
          lines: "33-55",
          summary:
            "Patrol 태스크의 초반부를 보면 Blackboard의 `Target` 값을 먼저 읽고, Target이 있으면 바로 빠져나온다. 순찰이 기본 상태이며, 전투 신호가 들어오면 즉시 우선순위를 넘겨준다는 뜻이다.",
          thesis:
            "이 부분은 Behavior Tree의 분기 논리를 코드로 읽는 좋은 예다. Selector의 의미가 추상 용어가 아니라 실제 조건 분기로 드러난다.",
          snippet: `AActor* Target = Cast<AActor>(BlackboardComp->GetValueAsObject(TEXT("Target")));
if (Target)
    return EBTNodeResult::Succeeded;

AMonsterBase* Monster = AIController->GetPawn<AMonsterBase>();
if (!Monster->GetPatrolEnable())
    return EBTNodeResult::Failed;

EPathFollowingRequestResult::Type MoveResult =
    AIController->MoveToLocation(Monster->GetPatrolPoint());

Monster->ChangeAnim(EMonsterNormalAnim::Walk);`,
        },
        {
          label: "Source Seminar D",
          title: "Patrol Task는 도착 판정 후 다음 포인트로 넘어간다",
          file: "Monster/BTTask_Patrol.cpp",
          lines: "81-126",
          summary:
            "Tick 구간은 단순한 진행 확인이 아니다. Target이 생겼는지, Move 상태가 Idle인지, 목표점까지 충분히 가까워졌는지를 체크한 뒤 태스크를 끝낸다. 종료 시 `NextPatrol()`을 호출해 다음 순찰점으로 진행한다.",
          thesis:
            "결국 Patrol은 '한 번 MoveToLocation 한다'가 아니라 '도착과 전투 신호를 동시에 감시하면서 상태를 넘기는 루프'다.",
          snippet: `EPathFollowingStatus::Type PathStatus = AIController->GetMoveStatus();
if (PathStatus == EPathFollowingStatus::Idle)
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}

float Distance = FVector::Dist(MonsterLocation, TargetLocation);
if (Distance <= 5.f)
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}

if (Monster->GetPatrolEnable())
{
    Monster->NextPatrol();
}`,
        },
      ],
      figures: [
        {
          src: "./assets/images/l2-spline-editor.jpg",
          alt: "레벨에서 스플라인 점을 편집하는 장면",
          time: "00:01:34",
          title: "도판 5. 스플라인 편집 화면",
          caption:
            "SpawnPoint를 선택했을 때 경로와 포인트가 보이는 화면이다. 스플라인을 입력 장치로 본다는 강의 관점을 가장 직관적으로 보여 준다.",
        },
        {
          src: "./assets/images/l2-onconstruction.jpg",
          alt: "OnConstruction에서 PatrolPoints를 채우는 코드",
          time: "00:12:55",
          title: "도판 6. OnConstruction에서 배열 갱신",
          caption:
            "스플라인 점을 월드 좌표 배열로 바꾸는 코드 장면이다. 편집용 데이터가 실행용 데이터로 변환되는 정확한 지점이다.",
        },
        {
          src: "./assets/images/l2-looped-path.jpg",
          alt: "레벨에서 루프형 스플라인 경로를 확인하는 장면",
          time: "00:24:40",
          title: "도판 7. 루프형 순찰 경로 확인",
          caption:
            "닫힌 루프 형태의 순찰 경로를 직접 확인하는 장면이다. 왕복과 루프 패턴을 스플라인 하나로 설계할 수 있다는 설명과 연결된다.",
        },
        {
          src: "./assets/images/l2-aitree-loader.jpg",
          alt: "AIController에서 Behavior Tree를 로드하는 코드",
          time: "00:43:40",
          title: "도판 8. SetAITree와 RunBehaviorTree",
          caption:
            "BT 에셋을 받아 로드하고 실행하는 코드 흐름을 보여 주는 장면이다. 강의에서 말한 'BT 등록'이 실제로 어떤 함수들로 이뤄지는지 감을 잡기 좋다.",
        },
        {
          src: "./assets/images/l2-possessedby-setup.jpg",
          alt: "MonsterNormal의 PossessedBy에서 BT를 연결하는 코드",
          time: "00:50:09",
          title: "도판 9. PossessedBy에서 BT 연결",
          caption:
            "몬스터가 빙의되는 시점에 BT 경로를 넘기는 코드 화면이다. 이 장의 핵심 접점을 가장 잘 보여 준다.",
        },
      ],
      labTasks: [
        "스플라인 점을 늘리거나 줄인 뒤 Patrol Task가 순찰 순서를 어떻게 소비하는지 기록한다.",
        "`BT_Monster_Normal`의 Blackboard에서 `Target` 키가 비어 있을 때 Patrol 브랜치가 도는지 확인한다.",
        "`PossessedBy`에서 BT 경로를 다른 에셋으로 바꿨을 때 어떤 차이가 생기는지 비교한다.",
        "`NextPatrol()` 호출 타이밍이 도착 판정과 어떻게 연결되는지 로그로 추적한다.",
      ],
      pitfalls: [
        "PatrolPoints 배열을 만들기만 하고 MonsterBase에 전달하지 않으면 순찰은 절대 시작되지 않는다.",
        "BT 등록 시점을 흐리게 이해하면 Controller가 없는 상태에서 BT를 띄우려다 디버깅이 복잡해진다.",
        "`Target` 키 타입이나 이름이 어긋나면 Selector 분기 자체가 무너진다.",
      ],
      reviewQuestions: [
        "MonsterBase가 DetectRange까지 보유하는 이유는 무엇인가?",
        "왜 `SetAITree`는 MonsterController가 아니라 MonsterNormal의 `PossessedBy`에서 호출되는가?",
        "Patrol Task가 Target을 먼저 읽고 빠져나오는 구조는 상위 Selector와 어떤 관계가 있는가?",
      ],
      takeaway: [
        "스플라인은 사람에게 친화적이고, PatrolPoints는 AI에게 친화적이다.",
        "BT 등록은 추상 개념이 아니라 PossessedBy라는 엔진 시점 위에 놓인다.",
        "Patrol은 기본 상태이며, Target의 출현이 그 상태를 깨는 첫 신호다.",
      ],
      references: [
        "MonsterBase.cpp 175-224",
        "MonsterNormal.cpp 27-35",
        "BTTask_Patrol.cpp 33-55",
        "BTTask_Patrol.cpp 81-126",
      ],
    },
    {
      id: "chapter-targeting",
      displayNo: "03",
      chapterNo: "Chapter III",
      code: "260415_3",
      title: "타겟 인식 및 Move To",
      strap:
        "팀 판정, 시야 감지, Blackboard, MoveToActor를 묶어 실제 추적 가능한 몬스터 AI의 최소 골격을 완성한다.",
      duration: "Lecture Span 00:00:02 - 00:50:35",
      tags: [
        "MonsterController.cpp",
        "BTTask_MonsterTrace.cpp",
        "GameInfo.h",
        "PlayerCharacter.cpp",
      ],
      intro:
        "세 번째 강의는 앞선 두 장에서 준비한 데이터를 실제 추적 AI로 연결하는 단계다. 하지만 소스를 읽어 보면, Move To는 결코 단독 기능이 아니다. MonsterBase의 팀 설정, PlayerCharacter의 팀 설정, MonsterController의 시야 구성, Blackboard의 Target, BTTask_MonsterTrace의 이동 호출이 한 번에 맞물려야 한다. 그래서 이 장은 '왜 AI가 안 움직이는가'를 해부하는 강의이기도 하다.",
      thesis:
        "이 장의 명제는 **감지 코드 하나만 맞춰서는 AI가 완성되지 않는다**는 것이다. `TeamPlayer`, `TeamMonster`, `SightRadius`, `RunBehaviorTree`, `OnTarget`, `MoveToActor`가 하나의 체계로 연결될 때에만 추적이 성립한다.",
      learningGoals: [
        "MonsterController가 어떤 시점에 어떤 감각과 팀 정보를 준비하는지 설명할 수 있다.",
        "`OnTarget`이 Blackboard와 속도 전환을 동시에 갱신하는 이유를 이해할 수 있다.",
        "`MoveToActor`가 실패할 때 Nav Mesh, 팀 ID, BT 실행 여부를 어떤 순서로 점검할지 정리할 수 있다.",
      ],
      sections: [
        {
          title: "1. 출발점은 감지가 아니라 올바른 빙의와 팀 판정이다",
          source: "자막 근거 00:00:55 - 00:09:17",
          body:
            "강의는 의외로 Perception보다 먼저 `AIControllerClass`, `AutoPossessAI`, 그리고 팀 설정을 확인한다. 이 순서가 맞다. 컨트롤러가 제대로 붙지 않았거나 팀 관계가 적대로 설정되지 않았으면 시야가 있어도 감지 이벤트가 들어오지 않는다. 소스에서도 MonsterBase는 `TeamMonster`, PlayerCharacter는 `TeamPlayer`를 명시한다.",
          bullets: [
            "`PlacedInWorldOrSpawned`는 배치 몬스터와 스폰 몬스터를 같은 규칙으로 묶는다.",
            "월드 아웃라이너에서 Controller가 실제로 생성됐는지 확인하는 습관이 중요하다.",
            "Perception 문제처럼 보여도 원인은 팀 설정이나 빙의 시점일 수 있다.",
          ],
        },
        {
          title: "2. OnTarget은 상태 저장과 속도 전환을 동시에 수행한다",
          source: "자막 근거 00:09:17 - 00:21:18",
          body:
            "강의 중반의 핵심은 `OnTarget(AActor*, FAIStimulus)`이다. 감지 성공이면 Blackboard의 `Target`에 액터를 기록하고, 실패면 `nullptr`로 지운다. 동시에 `DetectTarget(true/false)`를 호출해 몬스터 속도를 걷기와 달리기 사이에서 전환한다. 감지와 이동 상태가 같은 함수 안에서 묶이는 구조가 매우 중요하다.",
          bullets: [
            "`Target` 키는 BT 전체를 흔드는 상태 변수다.",
            "속도 전환을 같이 묶어야 추적 체감이 분명하게 바뀐다.",
            "Blackboard가 동작하려면 그 전에 `RunBehaviorTree`가 성공해야 한다.",
          ],
        },
        {
          title: "3. Move To는 Blackboard 값 위에서만 의미를 가진다",
          source: "자막 근거 00:22:26 - 00:35:42",
          body:
            "강의는 Blackboard와 Behavior Tree를 분리해서 설명하지만, 프로젝트를 읽으면 두 시스템은 거의 한 몸처럼 움직인다. `SetAITree`에서 BT가 실행되고, `OnTarget`이 Blackboard를 갱신하며, `BTTask_MonsterTrace`가 그 Target을 읽어 `MoveToActor`를 호출한다. 이 연결 고리가 바로 실제 추적 AI의 골격이다.",
          bullets: [
            "`Target` 값이 존재하면 전투 브랜치가 의미를 가진다.",
            "없으면 Patrol이나 Wait 같은 비전투 브랜치가 의미를 가진다.",
            "따라서 Blackboard는 단순 저장소가 아니라 트리의 실행 방향을 결정하는 중심축이다.",
          ],
        },
        {
          title: "4. Move To가 안 되면 Nav Mesh, 거리, 팀을 함께 본다",
          source: "자막 근거 00:36:16 - 00:50:35",
          body:
            "강의 후반은 사실상 실전 디버깅 교안이다. `MoveToActor`는 호출만으로 끝나지 않는다. 갈 수 있는 Nav Mesh가 있어야 하고, Target이 유효해야 하며, 공격 거리 안에 들어왔을 때 Trace Task가 적절히 종료되어야 한다. UE20252의 Trace Task는 캡슐 높이 보정 후 거리 비교까지 직접 수행한다.",
          bullets: [
            "Nav Mesh Bounds Volume이 없으면 Blackboard와 BT가 멀쩡해도 이동은 실패한다.",
            "Move 상태가 Idle인지, 거리 판정이 너무 타이트하지 않은지 함께 봐야 한다.",
            "추적과 공격의 경계는 `GetAttackDistance()`가 결정한다.",
          ],
        },
      ],
      sourceStudies: [
        {
          label: "Source Seminar A",
          title: "MonsterController 생성자에서 시야와 팀을 준비한다",
          file: "Monster/MonsterController.cpp",
          lines: "13-44",
          summary:
            "실제 컨트롤러는 생성자에서 `UAISenseConfig_Sight`를 만들고, SightRadius, LoseSightRadius, 시야각, 감지 대상 소속을 설정한 뒤 `OnTargetPerceptionUpdated`에 `OnTarget`을 바인딩한다.",
          thesis:
            "즉 Perception은 런타임 즉흥 기능이 아니라 컨트롤러가 태어나는 순간부터 준비되는 기본 능력이다. 강의에서 말한 '감지 구조'가 추상 용어가 아니라 생성자 수준의 초기화라는 점을 보자.",
          snippet: `mSightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("Sight"));
mSightConfig->SightRadius = 800.f;
mSightConfig->LoseSightRadius = 800.f;
mSightConfig->PeripheralVisionAngleDegrees = 180.f;
mSightConfig->DetectionByAffiliation.bDetectEnemies = true;

mAIPerception->ConfigureSense(*mSightConfig);
mAIPerception->SetDominantSense(mSightConfig->GetSenseImplementation());
SetGenericTeamId(FGenericTeamId(TeamMonster));

mAIPerception->OnTargetPerceptionUpdated.AddDynamic(
    this, &AMonsterController::OnTarget);`,
        },
        {
          label: "Source Seminar B",
          title: "SetAITree가 BT를 로드하고 실행한다",
          file: "Monster/MonsterController.cpp",
          lines: "75-98",
          summary:
            "`SetAITree`는 단지 경로를 저장하지 않는다. `TSoftObjectPtr<UBehaviorTree>`를 만들고, 현재 구현에서는 동기 로드 후 `RunBehaviorTree`까지 호출한다. Blackboard 초기화 역시 이 흐름 안에서 함께 준비된다.",
          thesis:
            "강의에서 말한 'BT 등록'은 추상 개념이 아니라 실제 런타임 초기화 절차다. 따라서 추적이 안 되면 `OnTarget`보다 먼저 여기서 BT가 정상 구동됐는지 봐야 한다.",
          snippet: `void AMonsterController::SetAITree(const FString& Path)
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
}`,
        },
        {
          label: "Source Seminar C",
          title: "OnTarget이 Target과 속도를 동시에 갱신한다",
          file: "Monster/MonsterController.cpp",
          lines: "158-187",
          summary:
            "강의 중반부 핵심 설명이 프로젝트 코드에서 가장 명확하게 드러나는 지점이다. 감지 성공 시 `Target`을 채우고 `DetectTarget(true)`를, 실패 시 `Target`을 비우고 `DetectTarget(false)`를 호출한다.",
          thesis:
            "이 함수 하나에 Blackboard 상태와 체감 속도 변화가 동시에 묶여 있기 때문에, 이 장을 이해하면 감지와 이동을 따로따로 보지 않게 된다.",
          snippet: `void AMonsterController::OnTarget(AActor* Actor, FAIStimulus Stimulus)
{
    if (!IsValid(mAITree) || !Blackboard)
        return;

    AMonsterBase* Monster = GetPawn<AMonsterBase>();
    if (!IsValid(Monster))
        return;

    if (Stimulus.WasSuccessfullySensed())
    {
        Blackboard->SetValueAsObject(TEXT("Target"), Actor);
        Monster->DetectTarget(true);
    }
    else
    {
        Blackboard->SetValueAsObject(TEXT("Target"), nullptr);
        Monster->DetectTarget(false);
    }
}`,
        },
        {
          label: "Source Seminar D",
          title: "Trace Task는 MoveToActor와 공격거리 판정을 함께 가진다",
          file: "Monster/BTTask_MonsterTrace.cpp",
          lines: "33-50, 103-123",
          summary:
            "Trace 태스크는 Blackboard의 Target을 읽어 `MoveToActor(Target)`를 호출하고, Tick 중에는 캡슐 높이 보정 후 거리를 계산해 공격 거리 안에 들어왔는지 확인한다. 강의 후반부의 Move To 설명이 실제로 이렇게 구현되어 있다.",
          thesis:
            "Move To는 하나의 노드 이름이 아니라, 타겟 조회, 이동 요청, 애니메이션 전환, 거리 종료 조건이 묶인 복합 행위다.",
          snippet: `AActor* Target = Cast<AActor>(BlackboardComp->GetValueAsObject(TEXT("Target")));
if (!Target)
    return EBTNodeResult::Failed;

EPathFollowingRequestResult::Type MoveResult = AIController->MoveToActor(Target);
Monster->ChangeAnim(EMonsterNormalAnim::Run);

float Distance = FVector::Dist(MonsterLocation, TargetLocation);
if (Distance <= Monster->GetAttackDistance())
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}`,
        },
        {
          label: "Source Seminar E",
          title: "팀 ID와 데이터 스키마가 감지 시스템의 전제다",
          file: "GameInfo.h · Player/PlayerCharacter.cpp",
          lines: "GameInfo.h 32-77, PlayerCharacter.cpp 43-47",
          summary:
            "프로젝트 전체에서 `TeamMonster = 30`, `TeamPlayer = 10`이 공용 기준으로 정의되고, PlayerCharacter 역시 시작 시점에 `SetGenericTeamId(FGenericTeamId(TeamPlayer))`를 호출한다. 또한 `FMonsterInfo`에는 DetectRange와 AttackDistance 같은 AI 핵심 파라미터가 들어 있다.",
          thesis:
            "감지와 추적을 이해하려면 MonsterController만 보면 부족하다. 팀 관계와 데이터 스키마를 같이 봐야 비로소 왜 감지 성공/실패가 갈리는지 설명할 수 있다.",
          snippet: `#define TeamNeutral 255
#define TeamMonster 30
#define TeamPlayer  10

struct FMonsterInfo : public FTableRowBase
{
    float WalkSpeed;
    float RunSpeed;
    float DetectRange;
    float AttackDistance;
};

GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
GetMesh()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
SetGenericTeamId(FGenericTeamId(TeamPlayer));`,
        },
      ],
      figures: [
        {
          src: "./assets/images/l3-controller-check.jpg",
          alt: "레벨에서 몬스터와 컨트롤러 상태를 확인하는 장면",
          time: "00:04:21",
          title: "도판 10. 월드에서 먼저 확인할 것",
          caption:
            "레벨에서 몬스터와 배치 상태를 보는 장면이다. 강의는 이 단계에서 Controller 생성 여부부터 확인하라고 강조한다.",
        },
        {
          src: "./assets/images/l3-ontarget-code.jpg",
          alt: "OnTarget 함수의 감지 성공과 실패 분기 코드",
          time: "00:14:52",
          title: "도판 11. OnTarget 분기 작성",
          caption:
            "`Stimulus.WasSuccessfullySensed()`를 기준으로 성공과 실패를 나누는 코드 장면이다. Blackboard Target 갱신의 출발점이다.",
        },
        {
          src: "./assets/images/l3-behavior-tree.jpg",
          alt: "Behavior Tree 에디터에서 Root와 Selector를 확인하는 장면",
          time: "00:22:33",
          title: "도판 12. Behavior Tree 기본 골격",
          caption:
            "BT 에디터에서 Root와 Selector를 두는 장면이다. Target 유무에 따라 전투와 순찰을 나누는 분기 구조를 떠올리기 좋다.",
        },
        {
          src: "./assets/images/l3-navmesh.jpg",
          alt: "레벨에 녹색 Nav Mesh 영역이 보이는 화면",
          time: "00:36:45",
          title: "도판 13. Move To보다 먼저 보는 Nav Mesh",
          caption:
            "녹색 내비게이션 영역을 확인하는 장면이다. 강의 후반부에서 가장 자주 언급되는 실제 실패 원인을 시각적으로 보여 준다.",
        },
        {
          src: "./assets/images/l3-runtime-chase.jpg",
          alt: "실행 중 몬스터 추적을 테스트하는 장면",
          time: "00:47:24",
          title: "도판 14. 추적 체감 테스트",
          caption:
            "추적 결과를 실제 플레이 화면에서 확인하는 장면이다. 이 구간에서 WalkSpeed, RunSpeed, Acceptable Radius의 체감 차이를 관찰할 수 있다.",
        },
      ],
      labTasks: [
        "MonsterController의 DetectRange 값을 조절하고 실제 시야 체감이 어떻게 달라지는지 기록한다.",
        "Nav Mesh를 잠시 제거한 뒤 `MoveToActor` 실패 상황을 재현하고 복구 절차를 정리한다.",
        "`Target`과 `AttackTarget` Blackboard 키가 어떤 상황에서 바뀌는지 로그로 남겨 본다.",
        "`WalkSpeed`와 `RunSpeed` 값을 서로 가깝게 혹은 크게 벌려 추적 체감 차이를 비교한다.",
      ],
      pitfalls: [
        "Controller가 실제로 빙의되지 않았는데 Perception 설정만 만지면 문제의 본질을 놓치기 쉽다.",
        "Target이 들어오는데 이동이 안 된다면 BT 실행, Nav Mesh, 팀 관계를 함께 봐야 한다.",
        "속도 전환이 없으면 추적이 되더라도 AI가 너무 둔하거나 미끄러져 보일 수 있다.",
      ],
      reviewQuestions: [
        "왜 `OnTarget`은 Blackboard 갱신과 속도 전환을 같은 함수 안에서 처리하는가?",
        "`MoveToActor`가 정상이어도 Nav Mesh가 없으면 어떤 현상이 생기는가?",
        "TeamMonster와 TeamPlayer가 감지 성공 여부에 미치는 영향은 무엇인가?",
      ],
      takeaway: [
        "추적 AI는 감지, 상태 저장, 이동, 속도 전환이 동시에 맞물릴 때 성립한다.",
        "`Target`은 Blackboard의 변수이면서 BT 전체의 분기 신호다.",
        "UE20252 프로젝트는 이미 AttackTask와 WaitTask까지 확장되어 있어 이후 과제 방향도 바로 잡을 수 있다.",
      ],
      references: [
        "MonsterController.cpp 13-44",
        "MonsterController.cpp 75-98",
        "MonsterController.cpp 158-187",
        "BTTask_MonsterTrace.cpp 33-50",
        "BTTask_MonsterTrace.cpp 103-123",
        "GameInfo.h 32-77",
        "PlayerCharacter.cpp 43-47",
      ],
    },
    {
      id: "chapter-targeting",
      displayNo: "03",
      chapterNo: "Chapter III",
      code: "260415_3",
      title: "타겟 인식 및 Move To",
      strap:
        "팀 판정, 시야 감지, Blackboard, MoveToActor를 묶어 실제 추적 가능한 몬스터 AI의 최소 골격을 완성한다.",
      duration: "Lecture Span 00:00:02 - 00:50:35",
      tags: [
        "MonsterController.cpp",
        "BTTask_MonsterTrace.cpp",
        "GameInfo.h",
        "PlayerCharacter.cpp",
      ],
      intro:
        "세 번째 강의는 앞선 두 장에서 준비한 데이터를 실제 추적 AI로 연결하는 단계다. 하지만 소스를 읽어 보면, Move To는 결코 단독 기능이 아니다. MonsterBase의 팀 설정, PlayerCharacter의 팀 설정, MonsterController의 시야 구성, Blackboard의 Target, BTTask_MonsterTrace의 이동 호출이 한 번에 맞물려야 한다. 그래서 이 장은 '왜 AI가 안 움직이는가'를 해부하는 강의이기도 하다.",
      thesis:
        "이 장의 명제는 **감지 코드 하나만 맞춰서는 AI가 완성되지 않는다**는 것이다. `TeamPlayer`, `TeamMonster`, `SightRadius`, `RunBehaviorTree`, `OnTarget`, `MoveToActor`가 하나의 체계로 연결될 때에만 추적이 성립한다.",
      learningGoals: [
        "MonsterController가 어떤 시점에 어떤 감각과 팀 정보를 준비하는지 설명할 수 있다.",
        "`OnTarget`이 Blackboard와 속도 전환을 동시에 갱신하는 이유를 이해할 수 있다.",
        "`MoveToActor`가 실패할 때 Nav Mesh, 팀 ID, BT 실행 여부를 어떤 순서로 점검할지 정리할 수 있다.",
      ],
      sections: [
        {
          title: "1. 출발점은 감지가 아니라 올바른 빙의와 팀 판정이다",
          source: "자막 근거 00:00:55 - 00:09:17",
          body:
            "강의는 의외로 Perception보다 먼저 `AIControllerClass`, `AutoPossessAI`, 그리고 팀 설정을 확인한다. 이 순서가 맞다. 컨트롤러가 제대로 붙지 않았거나 팀 관계가 적대로 설정되지 않았으면 시야가 있어도 감지 이벤트가 들어오지 않는다. 소스에서도 MonsterBase는 `TeamMonster`, PlayerCharacter는 `TeamPlayer`를 명시한다.",
          bullets: [
            "`PlacedInWorldOrSpawned`는 배치 몬스터와 스폰 몬스터를 같은 규칙으로 묶는다.",
            "월드 아웃라이너에서 Controller가 실제로 생성됐는지 확인하는 습관이 중요하다.",
            "Perception 문제처럼 보여도 원인은 팀 설정이나 빙의 시점일 수 있다.",
          ],
        },
        {
          title: "2. OnTarget은 상태 저장과 속도 전환을 동시에 수행한다",
          source: "자막 근거 00:09:17 - 00:21:18",
          body:
            "강의 중반의 핵심은 `OnTarget(AActor*, FAIStimulus)`이다. 감지 성공이면 Blackboard의 `Target`에 액터를 기록하고, 실패면 `nullptr`로 지운다. 동시에 `DetectTarget(true/false)`를 호출해 몬스터 속도를 걷기와 달리기 사이에서 전환한다. 감지와 이동 상태가 같은 함수 안에서 묶이는 구조가 매우 중요하다.",
          bullets: [
            "`Target` 키는 BT 전체를 흔드는 상태 변수다.",
            "속도 전환을 같이 묶어야 추적 체감이 분명하게 바뀐다.",
            "Blackboard가 동작하려면 그 전에 `RunBehaviorTree`가 성공해야 한다.",
          ],
        },
        {
          title: "3. Move To는 Blackboard 값 위에서만 의미를 가진다",
          source: "자막 근거 00:22:26 - 00:35:42",
          body:
            "강의는 Blackboard와 Behavior Tree를 분리해서 설명하지만, 프로젝트를 읽으면 두 시스템은 거의 한 몸처럼 움직인다. `SetAITree`에서 BT가 실행되고, `OnTarget`이 Blackboard를 갱신하며, `BTTask_MonsterTrace`가 그 Target을 읽어 `MoveToActor`를 호출한다. 이 연결 고리가 바로 실제 추적 AI의 골격이다.",
          bullets: [
            "`Target` 값이 존재하면 전투 브랜치가 의미를 가진다.",
            "없으면 Patrol이나 Wait 같은 비전투 브랜치가 의미를 가진다.",
            "따라서 Blackboard는 단순 저장소가 아니라 트리의 실행 방향을 결정하는 중심축이다.",
          ],
        },
        {
          title: "4. Move To가 안 되면 Nav Mesh, 거리, 팀을 함께 본다",
          source: "자막 근거 00:36:16 - 00:50:35",
          body:
            "강의 후반은 사실상 실전 디버깅 교안이다. `MoveToActor`는 호출만으로 끝나지 않는다. 갈 수 있는 Nav Mesh가 있어야 하고, Target이 유효해야 하며, 공격 거리 안에 들어왔을 때 Trace Task가 적절히 종료되어야 한다. UE20252의 Trace Task는 캡슐 높이 보정 후 거리 비교까지 직접 수행한다.",
          bullets: [
            "Nav Mesh Bounds Volume이 없으면 Blackboard와 BT가 멀쩡해도 이동은 실패한다.",
            "Move 상태가 Idle인지, 거리 판정이 너무 타이트하지 않은지 함께 봐야 한다.",
            "추적과 공격의 경계는 `GetAttackDistance()`가 결정한다.",
          ],
        },
      ],
      sourceStudies: [
        {
          label: "Source Seminar A",
          title: "MonsterController 생성자에서 시야와 팀을 준비한다",
          file: "Monster/MonsterController.cpp",
          lines: "13-44",
          summary:
            "실제 컨트롤러는 생성자에서 `UAISenseConfig_Sight`를 만들고, SightRadius, LoseSightRadius, 시야각, 감지 대상 소속을 설정한 뒤 `OnTargetPerceptionUpdated`에 `OnTarget`을 바인딩한다.",
          thesis:
            "즉 Perception은 런타임 즉흥 기능이 아니라 컨트롤러가 태어나는 순간부터 준비되는 기본 능력이다. 강의에서 말한 '감지 구조'가 추상 용어가 아니라 생성자 수준의 초기화라는 점을 보자.",
          snippet: `mSightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("Sight"));
mSightConfig->SightRadius = 800.f;
mSightConfig->LoseSightRadius = 800.f;
mSightConfig->PeripheralVisionAngleDegrees = 180.f;
mSightConfig->DetectionByAffiliation.bDetectEnemies = true;

mAIPerception->ConfigureSense(*mSightConfig);
mAIPerception->SetDominantSense(mSightConfig->GetSenseImplementation());
SetGenericTeamId(FGenericTeamId(TeamMonster));

mAIPerception->OnTargetPerceptionUpdated.AddDynamic(
    this, &AMonsterController::OnTarget);`,
        },
        {
          label: "Source Seminar B",
          title: "SetAITree가 BT를 로드하고 실행한다",
          file: "Monster/MonsterController.cpp",
          lines: "75-98",
          summary:
            "`SetAITree`는 단지 경로를 저장하지 않는다. `TSoftObjectPtr<UBehaviorTree>`를 만들고, 현재 구현에서는 동기 로드 후 `RunBehaviorTree`까지 호출한다. Blackboard 초기화 역시 이 흐름 안에서 함께 준비된다.",
          thesis:
            "강의에서 말한 'BT 등록'은 추상 개념이 아니라 실제 런타임 초기화 절차다. 따라서 추적이 안 되면 `OnTarget`보다 먼저 여기서 BT가 정상 구동됐는지 봐야 한다.",
          snippet: `void AMonsterController::SetAITree(const FString& Path)
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
}`,
        },
        {
          label: "Source Seminar C",
          title: "OnTarget이 Target과 속도를 동시에 갱신한다",
          file: "Monster/MonsterController.cpp",
          lines: "158-187",
          summary:
            "강의 중반부 핵심 설명이 프로젝트 코드에서 가장 명확하게 드러나는 지점이다. 감지 성공 시 `Target`을 채우고 `DetectTarget(true)`를, 실패 시 `Target`을 비우고 `DetectTarget(false)`를 호출한다.",
          thesis:
            "이 함수 하나에 Blackboard 상태와 체감 속도 변화가 동시에 묶여 있기 때문에, 이 장을 이해하면 감지와 이동을 따로따로 보지 않게 된다.",
          snippet: `void AMonsterController::OnTarget(AActor* Actor, FAIStimulus Stimulus)
{
    if (!IsValid(mAITree) || !Blackboard)
        return;

    AMonsterBase* Monster = GetPawn<AMonsterBase>();
    if (!IsValid(Monster))
        return;

    if (Stimulus.WasSuccessfullySensed())
    {
        Blackboard->SetValueAsObject(TEXT("Target"), Actor);
        Monster->DetectTarget(true);
    }
    else
    {
        Blackboard->SetValueAsObject(TEXT("Target"), nullptr);
        Monster->DetectTarget(false);
    }
}`,
        },
        {
          label: "Source Seminar D",
          title: "Trace Task는 MoveToActor와 공격거리 판정을 함께 가진다",
          file: "Monster/BTTask_MonsterTrace.cpp",
          lines: "33-50, 103-123",
          summary:
            "Trace 태스크는 Blackboard의 Target을 읽어 `MoveToActor(Target)`를 호출하고, Tick 중에는 캡슐 높이 보정 후 거리를 계산해 공격 거리 안에 들어왔는지 확인한다. 강의 후반부의 Move To 설명이 실제로 이렇게 구현되어 있다.",
          thesis:
            "Move To는 하나의 노드 이름이 아니라, 타겟 조회, 이동 요청, 애니메이션 전환, 거리 종료 조건이 묶인 복합 행위다.",
          snippet: `AActor* Target = Cast<AActor>(BlackboardComp->GetValueAsObject(TEXT("Target")));
if (!Target)
    return EBTNodeResult::Failed;

EPathFollowingRequestResult::Type MoveResult = AIController->MoveToActor(Target);
Monster->ChangeAnim(EMonsterNormalAnim::Run);

float Distance = FVector::Dist(MonsterLocation, TargetLocation);
if (Distance <= Monster->GetAttackDistance())
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}`,
        },
        {
          label: "Source Seminar E",
          title: "팀 ID와 데이터 스키마가 감지 시스템의 전제다",
          file: "GameInfo.h · Player/PlayerCharacter.cpp",
          lines: "GameInfo.h 32-77, PlayerCharacter.cpp 43-47",
          summary:
            "프로젝트 전체에서 `TeamMonster = 30`, `TeamPlayer = 10`이 공용 기준으로 정의되고, PlayerCharacter 역시 시작 시점에 `SetGenericTeamId(FGenericTeamId(TeamPlayer))`를 호출한다. 또한 `FMonsterInfo`에는 DetectRange와 AttackDistance 같은 AI 핵심 파라미터가 들어 있다.",
          thesis:
            "감지와 추적을 이해하려면 MonsterController만 보면 부족하다. 팀 관계와 데이터 스키마를 같이 봐야 비로소 왜 감지 성공/실패가 갈리는지 설명할 수 있다.",
          snippet: `#define TeamNeutral 255
#define TeamMonster 30
#define TeamPlayer  10

struct FMonsterInfo : public FTableRowBase
{
    float WalkSpeed;
    float RunSpeed;
    float DetectRange;
    float AttackDistance;
};

GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
GetMesh()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
SetGenericTeamId(FGenericTeamId(TeamPlayer));`,
        },
      ],
      figures: [
        {
          src: "./assets/images/l3-controller-check.jpg",
          alt: "레벨에서 몬스터와 컨트롤러 상태를 확인하는 장면",
          time: "00:04:21",
          title: "도판 10. 월드에서 먼저 확인할 것",
          caption:
            "레벨에서 몬스터와 배치 상태를 보는 장면이다. 강의는 이 단계에서 Controller 생성 여부부터 확인하라고 강조한다.",
        },
        {
          src: "./assets/images/l3-ontarget-code.jpg",
          alt: "OnTarget 함수의 감지 성공과 실패 분기 코드",
          time: "00:14:52",
          title: "도판 11. OnTarget 분기 작성",
          caption:
            "`Stimulus.WasSuccessfullySensed()`를 기준으로 성공과 실패를 나누는 코드 장면이다. Blackboard Target 갱신의 출발점이다.",
        },
        {
          src: "./assets/images/l3-behavior-tree.jpg",
          alt: "Behavior Tree 에디터에서 Root와 Selector를 확인하는 장면",
          time: "00:22:33",
          title: "도판 12. Behavior Tree 기본 골격",
          caption:
            "BT 에디터에서 Root와 Selector를 두는 장면이다. Target 유무에 따라 전투와 순찰을 나누는 분기 구조를 떠올리기 좋다.",
        },
        {
          src: "./assets/images/l3-navmesh.jpg",
          alt: "레벨에 녹색 Nav Mesh 영역이 보이는 화면",
          time: "00:36:45",
          title: "도판 13. Move To보다 먼저 보는 Nav Mesh",
          caption:
            "녹색 내비게이션 영역을 확인하는 장면이다. 강의 후반부에서 가장 자주 언급되는 실제 실패 원인을 시각적으로 보여 준다.",
        },
        {
          src: "./assets/images/l3-runtime-chase.jpg",
          alt: "실행 중 몬스터 추적을 테스트하는 장면",
          time: "00:47:24",
          title: "도판 14. 추적 체감 테스트",
          caption:
            "추적 결과를 실제 플레이 화면에서 확인하는 장면이다. 이 구간에서 WalkSpeed, RunSpeed, Acceptable Radius의 체감 차이를 관찰할 수 있다.",
        },
      ],
      labTasks: [
        "MonsterController의 DetectRange 값을 조절하고 실제 시야 체감이 어떻게 달라지는지 기록한다.",
        "Nav Mesh를 잠시 제거한 뒤 `MoveToActor` 실패 상황을 재현하고 복구 절차를 정리한다.",
        "`Target`과 `AttackTarget` Blackboard 키가 어떤 상황에서 바뀌는지 로그로 남겨 본다.",
        "`WalkSpeed`와 `RunSpeed` 값을 서로 가깝게 혹은 크게 벌려 추적 체감 차이를 비교한다.",
      ],
      pitfalls: [
        "Controller가 실제로 빙의되지 않았는데 Perception 설정만 만지면 문제의 본질을 놓치기 쉽다.",
        "Target이 들어오는데 이동이 안 된다면 BT 실행, Nav Mesh, 팀 관계를 함께 봐야 한다.",
        "속도 전환이 없으면 추적이 되더라도 AI가 너무 둔하거나 미끄러져 보일 수 있다.",
      ],
      reviewQuestions: [
        "왜 `OnTarget`은 Blackboard 갱신과 속도 전환을 같은 함수 안에서 처리하는가?",
        "`MoveToActor`가 정상이어도 Nav Mesh가 없으면 어떤 현상이 생기는가?",
        "TeamMonster와 TeamPlayer가 감지 성공 여부에 미치는 영향은 무엇인가?",
      ],
      takeaway: [
        "추적 AI는 감지, 상태 저장, 이동, 속도 전환이 동시에 맞물릴 때 성립한다.",
        "`Target`은 Blackboard의 변수이면서 BT 전체의 분기 신호다.",
        "UE20252 프로젝트는 이미 AttackTask와 WaitTask까지 확장되어 있어 이후 과제 방향도 바로 잡을 수 있다.",
      ],
      references: [
        "MonsterController.cpp 13-44",
        "MonsterController.cpp 75-98",
        "MonsterController.cpp 158-187",
        "BTTask_MonsterTrace.cpp 33-50",
        "BTTask_MonsterTrace.cpp 103-123",
        "GameInfo.h 32-77",
        "PlayerCharacter.cpp 43-47",
      ],
    },
  ],
  pipeline: [
    {
      title: "SpawnPoint 배치",
      detail:
        "레벨 디자이너가 `MonsterSpawnPoint`를 월드에 배치하고 `SpawnClass`, `SpawnTime`, `PatrolPath`를 설정한다.",
    },
    {
      title: "OnConstruction 변환",
      detail:
        "`USplineComponent`의 포인트를 월드 좌표 `PatrolPoints` 배열로 평탄화해 런타임 입력으로 바꾼다.",
    },
    {
      title: "SpawnMonster 호출",
      detail:
        "CDO 캡슐 높이로 스폰 위치를 보정하고 `SpawnActor` 후 `SetSpawnPoint`, `SetPatrolPoints`를 주입한다.",
    },
    {
      title: "MonsterBase 초기화",
      detail:
        "`MonsterInfoLoadComplete`가 데이터 테이블 기반 스탯을 채우고 `WalkSpeed`, `RunSpeed`, `DetectRange`를 준비한다.",
    },
    {
      title: "MonsterController 구동",
      detail:
        "`SetAITree`, `RunBehaviorTree`, `UAIPerceptionComponent`, `OnTarget`가 Blackboard의 `Target` 값을 유지한다.",
    },
    {
      title: "BT Task 실행",
      detail:
        "Target이 없으면 `BTTask_Patrol`, 있으면 `BTTask_MonsterTrace`, 가까워지면 `BTTask_MonsterAttack`으로 확장된다.",
    },
  ],
  sourceAtlas: [
    {
      chapter: "Chapter I",
      title: "MonsterSpawnPoint.h / .cpp",
      file: "Monster/MonsterSpawnPoint.h · Monster/MonsterSpawnPoint.cpp",
      role: "스폰 액터의 핵심 정의. `mSpawnClass`, `mSpawnTime`, `PatrolPath`, 리스폰 타이머, `SpawnMonster`가 모두 여기에 있다.",
      points: [
        "`OnConstruction`에서 `PatrolPath -> mPatrolPoints` 변환이 수행된다.",
        "`SpawnMonster`는 CDO 캡슐 높이로 스폰 위치를 보정한다.",
        "`SetSpawnPoint`, `SetPatrolPoints`로 MonsterBase에 초기 정보를 넘긴다.",
      ],
    },
    {
      chapter: "Chapter I-II",
      title: "MonsterBase.h / .cpp",
      file: "Monster/MonsterBase.h · Monster/MonsterBase.cpp",
      role: "패트롤 데이터 저장소이자 몬스터 상태의 중심. 팀 ID, 이동 속도, DetectRange, AttackDistance가 이 계층에 정리된다.",
      points: [
        "`GetPatrolEnable`, `GetPatrolPoint`, `NextPatrol`이 BTTask_Patrol과 직접 연결된다.",
        "`AIControllerClass = AMonsterController::StaticClass()`로 컨트롤러를 고정한다.",
        "`MonsterInfoLoadComplete`가 데이터 자산 값을 읽어 AIController에 DetectRange를 전달한다.",
      ],
    },
    {
      chapter: "Chapter II-III",
      title: "MonsterController.h / .cpp",
      file: "Monster/MonsterController.h · Monster/MonsterController.cpp",
      role: "Perception, 시야 범위, BT 등록, Blackboard 갱신이 만나는 컨트롤러 계층이다.",
      points: [
        "`UAIPerceptionComponent`와 `UAISenseConfig_Sight`가 생성자에서 준비된다.",
        "`SetAITree`가 실제 BT 에셋 경로를 받아 `RunBehaviorTree`까지 이어진다.",
        "`OnTarget`이 `Target` 키와 몬스터 이동 속도를 동시에 업데이트한다.",
      ],
    },
    {
      chapter: "Chapter II",
      title: "MonsterNormal.cpp",
      file: "Monster/MonsterNormal.cpp",
      role: "몬스터가 실제로 어떤 BT를 사용할지 결정하는 작은 접점. `PossessedBy`에서 `SetAITree`를 호출한다.",
      points: [
        "강의에서 설명한 BT 등록 시점이 코드에서 정확히 `PossessedBy`로 구현돼 있다.",
        "BT 경로가 문자열 자산 경로로 하드코딩되어 있다.",
      ],
    },
    {
      chapter: "Chapter II",
      title: "BTTask_Patrol.cpp",
      file: "Monster/BTTask_Patrol.cpp",
      role: "Target이 비어 있을 때 PatrolPoints를 따라 걷게 만드는 순찰 태스크.",
      points: [
        "`MoveToLocation(Monster->GetPatrolPoint())`가 실제 순찰 이동 호출이다.",
        "Target이 생기면 즉시 종료해 전투 브랜치로 넘어갈 수 있게 한다.",
        "도착하면 `NextPatrol()`로 다음 인덱스로 넘어간다.",
      ],
    },
    {
      chapter: "Chapter III",
      title: "BTTask_MonsterTrace.cpp",
      file: "Monster/BTTask_MonsterTrace.cpp",
      role: "Target을 향한 실제 추적 태스크. `MoveToActor`와 공격 거리 판정이 핵심이다.",
      points: [
        "`MoveToActor(Target)`로 Blackboard Target을 내비게이션 목표로 사용한다.",
        "거리 계산은 캡슐 높이 보정 후 `GetAttackDistance()`와 비교한다.",
        "추적 중에는 Run 애니메이션으로 전환된다.",
      ],
    },
    {
      chapter: "Beyond Lecture",
      title: "BTTask_MonsterAttack.cpp / BTTask_MonsterWait.cpp",
      file: "Monster/BTTask_MonsterAttack.cpp · Monster/BTTask_MonsterWait.cpp",
      role: "260415 강의 이후 프로젝트가 이미 확장한 부분. 공격 대상 보관, 공격 종료 플래그, 패트롤 대기 시간이 구현돼 있다.",
      points: [
        "`AttackTarget`, `AttackEnd`, `WaitTime` 같은 Blackboard 키가 확장 포인트가 된다.",
        "Trace에서 Attack으로 이어지는 후속 구조를 미리 읽을 수 있다.",
      ],
    },
    {
      chapter: "Chapter III",
      title: "GameInfo.h / PlayerCharacter.cpp",
      file: "GameInfo.h · Player/PlayerCharacter.cpp",
      role: "팀 ID와 공용 데이터 스키마의 기준. 감지 성공/실패를 이해하려면 이 파일을 반드시 같이 봐야 한다.",
      points: [
        "`TeamMonster = 30`, `TeamPlayer = 10`이 공용 기준으로 정의된다.",
        "`FMonsterInfo`에 `WalkSpeed`, `RunSpeed`, `DetectRange`, `AttackDistance`가 있다.",
        "PlayerCharacter도 `SetGenericTeamId(FGenericTeamId(TeamPlayer))`를 호출한다.",
      ],
    },
  ],
  chapters: [
    {
      id: "chapter-spawnpoint",
      displayNo: "01",
      chapterNo: "Chapter I",
      code: "260415_1",
      title: "SpawnPoint 기초",
      strap:
        "몬스터를 월드에 직접 두는 대신, 레벨 배치용 액터가 스폰 규칙과 순찰 입력을 보관하도록 구조를 분리한다.",
      duration: "Lecture Span 00:00:00 - 00:47:24",
      tags: [
        "MonsterSpawnPoint.h",
        "MonsterSpawnPoint.cpp",
        "MonsterBase.h",
      ],
      intro:
        "첫 강의의 핵심은 몬스터를 필드에 직접 박아 두는 구조에서 벗어나는 것이다. 강의는 `MonsterSpawnPoint`를 AActor 기반 도구로 세우고, 스폰 클래스, 리스폰 시간, 순찰 경로를 이 액터가 들고 있게 만든다. 이렇게 하면 몬스터 자체는 '태어난 뒤의 행동'에 집중하고, SpawnPoint는 '언제 어디서 태어날지'를 전담하게 된다.",
      thesis:
        "이 장의 명제는 단순하다. 몬스터 AI의 첫 단계는 전투 로직이 아니라 **배치와 재생성의 책임 분리**이다. 프로젝트 소스에서도 이 철학이 `mSpawnClass`, `mSpawnTime`, `SetSpawnPoint`, `SetPatrolPoints`로 명확히 드러난다.",
      learningGoals: [
        "`MonsterSpawnPoint`를 `AActor`로 설계해야 하는 이유를 설명할 수 있다.",
        "`TSubclassOf<AMonsterBase>`와 `mSpawnTime`이 각각 무엇을 데이터화하는지 구분할 수 있다.",
        "`PatrolPath`, `PatrolPoints`, `SpawnMonster`가 서로 어떤 순서로 연결되는지 추적할 수 있다.",
      ],
      sections: [
        {
          title: "1. 레벨 배치용 액터를 따로 두는 이유",
          source: "자막 근거 00:00:00 - 00:05:27",
          body:
            "강의는 레벨에 몬스터를 직접 놓으면 재등장, 위치 관리, 필드형 운영이 빠르게 불편해진다고 짚는다. 그래서 몬스터 인스턴스가 아니라 몬스터를 만들어 내는 스폰 지점을 월드에 배치한다. 이것이 단순한 편의 기능이 아니라, 필드형 몬스터 구조의 시작점이라는 점이 중요하다.",
          bullets: [
            "죽은 뒤 같은 자리에서 다시 나타나는 패턴을 자연스럽게 지원한다.",
            "스폰 위치, 생성 대상, 리스폰 시간, 순찰 입력을 하나의 오브젝트로 묶을 수 있다.",
            "강의의 후반부 AI 설명도 결국 이 SpawnPoint에서 넘겨주는 데이터 위에서 시작된다.",
          ],
        },
        {
          title: "2. Root, Arrow, PatrolPath로 편집 도구를 만든다",
          source: "자막 근거 00:05:54 - 00:11:00",
          body:
            "SpawnPoint는 단순한 논리 클래스가 아니라 에디터에서 직접 배치하는 도구다. 루트 컴포넌트와 에디터용 Arrow, 그리고 `USplineComponent`를 붙여 둠으로써, 디자이너는 월드에서 스폰 위치와 순찰 방향을 직관적으로 편집할 수 있다.",
          bullets: [
            "`USceneComponent` 루트는 스폰 지점의 공간 좌표 기준이 된다.",
            "Arrow는 바라보는 방향과 스폰 마커를 시각화한다.",
            "`PatrolPath`는 다음 장의 순찰 입력으로 바로 이어지는 핵심 컴포넌트다.",
          ],
        },
        {
          title: "3. 스폰 규칙을 변수로 노출한다",
          source: "자막 근거 00:11:02 - 00:30:38",
          body:
            "객체 인스턴스를 잡아 두는 대신, SpawnPoint는 클래스 정보를 가진다. 강의가 `TSubclassOf<AMonsterBase>`를 고른 이유는, 레벨 디자이너가 Details 패널에서 어떤 몬스터를 생성할지 안전하게 선택하게 하기 위해서다. `mSpawnTime`은 스폰 정책을 시간 값 하나로 표현하는 간단하고 강력한 입력이 된다.",
          bullets: [
            "`mSpawnClass`는 생성 대상의 타입을 결정한다.",
            "`mSpawnTime`은 즉시 리스폰과 지연 리스폰을 같은 인터페이스로 다룬다.",
            "이 두 값만으로도 SpawnPoint마다 서로 다른 성격을 쉽게 만들 수 있다.",
          ],
        },
        {
          title: "4. 몬스터를 낳고, 초기 정보를 같이 넘긴다",
          source: "자막 근거 00:31:08 - 00:47:24",
          body:
            "후반부에서 강의는 SpawnPoint가 단순히 SpawnActor를 호출하는 것에서 끝나지 않는다고 강조한다. 스폰된 몬스터는 자신을 낳은 SpawnPoint를 알아야 하고, 순찰에 필요한 좌표 배열도 함께 받아야 한다. 프로젝트 소스 역시 `SetSpawnPoint(this)`와 `SetPatrolPoints(mPatrolPoints)`를 바로 호출한다.",
          bullets: [
            "SpawnPoint는 생성기이면서도 몬스터의 초기 문맥을 주입하는 허브다.",
            "리스폰은 타이머로 독립적으로 관리되므로 여러 SpawnPoint가 서로 다른 리듬을 가질 수 있다.",
            "캡슐 절반 높이 보정과 충돌 처리 방식은 실전에서 스폰 실패를 줄이는 중요한 디테일이다.",
          ],
        },
      ],
      sourceStudies: [
        {
          label: "Source Seminar A",
          title: "OnConstruction에서 PatrolPoints를 재구성한다",
          file: "Monster/MonsterSpawnPoint.cpp",
          lines: "50-66",
          summary:
            "강의에서 'BeginPlay보다 OnConstruction이 편하다'고 말한 부분이 실제 코드에서는 `mPatrolPoints.Empty()` 후 `GetLocationAtSplinePoint(..., ESplineCoordinateSpace::World)`를 순회하는 구조로 구현되어 있다.",
          thesis:
            "즉 `PatrolPath`는 편집용 입력이고, `mPatrolPoints`는 런타임용 실행 데이터다. 이 구분이 260415 강의의 핵심 설계 철학이다.",
          snippet: `void AMonsterSpawnPoint::OnConstruction(const FTransform& Transform)
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
}`,
        },
        {
          label: "Source Seminar B",
          title: "SpawnMonster는 CDO 캡슐 높이까지 고려한다",
          file: "Monster/MonsterSpawnPoint.cpp",
          lines: "86-116",
          summary:
            "실제 프로젝트는 강의에서 언급된 '바닥 밑으로 몬스터가 들어가는 문제'를 매우 직접적으로 다룬다. `mSpawnClass`의 CDO에서 캡슐 높이를 읽어 `SpawnLocation.Z`를 보정한 뒤 SpawnActor를 호출한다.",
          thesis:
            "이 코드는 강의의 개념 설명을 실무적 안정성으로 바꿔 주는 지점이다. 단순 스폰이 아니라 **높이 보정 + 충돌 처리 + 문맥 주입**까지 하나의 함수 안에 묶여 있다.",
          snippet: `void AMonsterSpawnPoint::SpawnMonster()
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

        FActorSpawnParameters param;
        param.SpawnCollisionHandlingOverride =
            ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

        mSpawnMonster = GetWorld()->SpawnActor<AMonsterBase>(
            mSpawnClass, SpawnLocation, GetActorRotation(), param);

        mSpawnMonster->SetSpawnPoint(this);
        mSpawnMonster->SetPatrolPoints(mPatrolPoints);
    }
}`,
        },
        {
          label: "Source Seminar C",
          title: "MonsterBase는 Patrol 데이터를 소비하는 인터페이스를 가진다",
          file: "Monster/MonsterBase.h",
          lines: "44-78",
          summary:
            "SpawnPoint가 넘긴 순찰 배열은 `MonsterBase` 내부에 저장되고, 이후 BTTask_Patrol이 `GetPatrolEnable`, `GetPatrolPoint`, `NextPatrol`을 통해 소비한다. 즉 SpawnPoint와 BTTask 사이를 직접 연결하는 중간 매개가 MonsterBase다.",
          thesis:
            "강의의 흐름상 SpawnPoint 파트와 Patrol 파트는 분리돼 보이지만, 실제 코드는 MonsterBase를 매개로 두 장을 하나의 연속 구조로 만든다.",
          snippet: `bool GetPatrolEnable() const
{
    return mPatrolPoints.Num() > 1;
}

FVector GetPatrolPoint() const
{
    return mPatrolPoints[mPatrolIndex];
}

void NextPatrol()
{
    mPatrolIndex = (mPatrolIndex + 1) % mPatrolPoints.Num();
}

void SetSpawnPoint(class AMonsterSpawnPoint* Point)
{
    mSpawnPoint = Point;
}

void SetPatrolPoints(const TArray<FVector>& Points)
{
    mPatrolPoints = Points;
}`,
        },
      ],
      figures: [
        {
          src: "./assets/images/l1-class-creation.jpg",
          alt: "SpawnPoint용 C++ 클래스를 생성하는 에디터 장면",
          time: "00:07:12",
          title: "도판 1. AActor 기반 클래스 생성",
          caption:
            "부모 클래스를 Actor로 선택하는 장면이다. SpawnPoint를 월드에 직접 배치하고 회전·위치를 관리해야 하므로 `AActor`가 자연스러운 선택이 된다.",
        },
        {
          src: "./assets/images/l1-root-arrow-spline.jpg",
          alt: "루트, 화살표, 스플라인 컴포넌트를 추가하는 코드 화면",
          time: "00:12:45",
          title: "도판 2. Root, Arrow, PatrolPath 구조",
          caption:
            "루트 컴포넌트와 에디터용 Arrow를 붙이는 코드 화면이다. 이 장면은 SpawnPoint가 단순한 논리 객체가 아니라 편집용 도구라는 사실을 가장 잘 보여 준다.",
        },
        {
          src: "./assets/images/l1-spawn-properties.jpg",
          alt: "mSpawnClass와 mSpawnTime 프로퍼티 선언 코드",
          time: "00:21:45",
          title: "도판 3. SpawnClass와 SpawnTime 노출",
          caption:
            "`TSubclassOf<AMonsterBase>`와 `float mSpawnTime`이 실제로 선언된 화면이다. 강의의 설명이 바로 프로젝트 코드의 편집 입력으로 연결된다.",
        },
        {
          src: "./assets/images/l1-respawn-timer.jpg",
          alt: "SpawnTimerFinish와 타이머 호출 코드 화면",
          time: "00:43:57",
          title: "도판 4. 재스폰 타이머 마무리",
          caption:
            "리스폰 타이머와 후속 호출 구조를 마무리하는 장면이다. SpawnPoint가 자기 리듬으로 몬스터를 공급하는 구조가 여기서 완성된다.",
        },
      ],
      labTasks: [
        "SpawnPoint를 하나 배치하고 `SpawnClass`, `SpawnTime`을 바꿔가며 생성 패턴을 비교한다.",
        "스플라인 점을 에디터에서 움직인 뒤 PatrolPoints가 다시 계산되는지 확인한다.",
        "다른 크기의 몬스터 클래스를 넣고 캡슐 높이 보정이 스폰 위치에 어떤 차이를 만드는지 관찰한다.",
        "`mSpawnTime = 0`과 `mSpawnTime > 0`의 리스폰 체감을 비교한다.",
      ],
      pitfalls: [
        "SpawnPoint를 단순한 컴포넌트처럼 생각하면 월드 배치와 방향 관리가 어색해진다.",
        "`mSpawnClass`를 클래스 타입이 아니라 인스턴스 참조처럼 다루면 스폰 책임과 런타임 상태가 뒤섞인다.",
        "리스폰이 실패하면 타이머보다 먼저 캡슐 높이, 충돌 처리, 스폰 위치를 점검해야 한다.",
      ],
      reviewQuestions: [
        "왜 `BeginPlay`가 아니라 `OnConstruction`에서 PatrolPoints를 만드는가?",
        "SpawnPoint가 `SetSpawnPoint`, `SetPatrolPoints`를 바로 호출하는 설계는 어떤 장점을 주는가?",
        "스폰 위치 보정에 CDO 캡슐 정보를 쓰는 이유는 무엇인가?",
      ],
      takeaway: [
        "오늘의 산출물은 몬스터 자체가 아니라 몬스터를 낳는 시스템이다.",
        "SpawnPoint는 편집기 입력, 리스폰 규칙, 초기 문맥 주입을 한곳에 묶는 허브다.",
        "이 구조가 있어야 다음 장의 Patrol과 BT가 자연스럽게 연결된다.",
      ],
      references: [
        "MonsterSpawnPoint.h 32-73",
        "MonsterSpawnPoint.cpp 50-66",
        "MonsterSpawnPoint.cpp 86-116",
        "MonsterBase.h 44-78",
      ],
    },
    {
      id: "chapter-patrol",
      displayNo: "02",
      chapterNo: "Chapter II",
      code: "260415_2",
      title: "SplineComponent와 BehaviorTree 등록",
      strap:
        "편집용 스플라인을 실제 순찰 좌표로 바꾸고, 몬스터가 사용할 Behavior Tree를 컨트롤러에 등록한다.",
      duration: "Lecture Span 00:00:00 - 00:51:31",
      tags: [
        "MonsterBase.cpp",
        "MonsterNormal.cpp",
        "BTTask_Patrol.cpp",
      ],
      intro:
        "두 번째 강의는 SpawnPoint 내부에 들어 있던 순찰 입력을 실제 AI 행동 구조로 끌어올리는 단계다. 스플라인을 좌표 배열로 바꾸는 것만으로는 충분하지 않고, 몬스터가 그 배열을 들고 있어야 하며, 동시에 어떤 Behavior Tree를 구동할지도 지정되어야 한다. UE20252 소스는 이 세 단계를 `MonsterBase`, `MonsterNormal`, `BTTask_Patrol`로 명확하게 분리한다.",
      thesis:
        "이 장의 명제는 **편집 도구와 실행 트리 사이에는 반드시 번역 계층이 필요하다**는 것이다. Spline은 인간 친화적이고, PatrolPoints는 AI 친화적이며, BT는 판단 친화적이다. 강의는 이 세 층을 차례로 연결한다.",
      learningGoals: [
        "`PatrolPath`와 `PatrolPoints`가 서로 다른 책임을 가진다는 사실을 설명할 수 있다.",
        "`MonsterNormal::PossessedBy`가 BT 등록의 적절한 시점인 이유를 이해할 수 있다.",
        "`BTTask_Patrol`이 Target 유무, MoveToLocation, 도착 판정을 어떻게 처리하는지 읽을 수 있다.",
      ],
      sections: [
        {
          title: "1. 스플라인은 순찰 경로를 편집하는 입력 장치다",
          source: "자막 근거 00:00:33 - 00:08:17",
          body:
            "강의는 스플라인을 복잡한 수학 개념으로 다루지 않고, 점을 찍고 드래그해 경로를 만드는 편집 장치로 설명한다. 이는 매우 중요한 접근이다. 실제 AI는 좌표 배열만 필요하지만, 디자이너는 곡선과 핸들을 직접 보며 작업하는 편이 훨씬 쉽기 때문이다.",
          bullets: [
            "열린 경로와 닫힌 루프를 같은 툴에서 편하게 다룰 수 있다.",
            "순찰 입력을 시각화하면 런타임 디버깅보다 훨씬 앞단에서 오류를 줄일 수 있다.",
            "이 장의 핵심은 '스플라인 자체를 쓰는 법'보다 '스플라인을 AI용 데이터로 번역하는 법'에 있다.",
          ],
        },
        {
          title: "2. MonsterBase는 데이터를 보관하고 AI 파라미터를 주입받는다",
          source: "자막 근거 00:18:16 - 00:23:10, 00:38:38 이후 소스 대조",
          body:
            "실제 프로젝트를 보면 `MonsterInfoLoadComplete`에서 몬스터 데이터가 채워지고, 그 과정에서 `WalkSpeed`, `RunSpeed`, `DetectRange`, `AttackDistance`가 모두 세팅된다. 곧 PatrolPoints뿐 아니라 앞으로의 추적과 공격 거리도 이 계층에 쌓이는 셈이다.",
          bullets: [
            "MonsterBase는 단순 Pawn이 아니라 데이터와 움직임의 허브다.",
            "DetectRange를 AIController로 전달하는 지점이 이 파일 안에 있다.",
            "즉 순찰과 전투의 연결 고리도 사실상 MonsterBase가 들고 있다.",
          ],
        },
        {
          title: "3. BT 등록의 시작점은 PossessedBy다",
          source: "자막 근거 00:38:38 - 00:45:09",
          body:
            "강의는 몬스터가 어떤 Behavior Tree를 쓸지 정하는 시점으로 `PossessedBy`를 설명한다. 실제 코드에서도 `MonsterNormal::PossessedBy`가 컨트롤러를 캐스팅하고 `SetAITree`를 호출한다. 중요한 점은, BT 등록이 몬스터 인스턴스가 실제로 컨트롤러에 빙의된 뒤에 이뤄진다는 것이다.",
          bullets: [
            "이 시점이면 AIController가 실제로 존재하고 Blackboard/BT 초기화가 가능하다.",
            "강의 내용이 추상 개념이 아니라 실제 엔진 라이프사이클과 맞물려 있다.",
            "BT 에셋 경로가 무엇인지, 누가 주는지, 언제 주는지가 여기서 정리된다.",
          ],
        },
        {
          title: "4. Patrol Task는 Target이 없을 때만 유효하다",
          source: "자막 근거 00:34:15 - 00:51:31 + 프로젝트 태스크 대조",
          body:
            "프로젝트의 `BTTask_Patrol`을 보면 순찰 로직은 생각보다 절제되어 있다. Blackboard에 `Target`이 생기면 곧바로 성공 처리해 상위 Selector가 전투 브랜치를 다시 평가하게 만든다. Target이 비어 있을 때만 `MoveToLocation(Monster->GetPatrolPoint())`가 실행된다.",
          bullets: [
            "순찰은 기본 상태이고, Target이 생기는 순간 우선순위를 양보한다.",
            "도착 판정은 단순히 MoveTo 호출 결과가 아니라 거리 계산으로 한 번 더 확인한다.",
            "`NextPatrol()` 호출로 다음 웨이포인트 인덱스를 관리한다.",
          ],
        },
      ],
      sourceStudies: [
        {
          label: "Source Seminar A",
          title: "MonsterInfoLoadComplete는 AI 파라미터를 실제 값으로 채운다",
          file: "Monster/MonsterBase.cpp",
          lines: "175-224",
          summary:
            "강의에서는 DetectRange와 속도 전환이 개념적으로 설명되지만, 실제 프로젝트에서는 그 값이 데이터 테이블 기반 `FMonsterInfo`에서 들어온다. `MonsterInfoLoadComplete`가 바로 그 주입 지점이다.",
          thesis:
            "즉 Patrol과 Trace는 하드코딩된 상수가 아니라 데이터 자산으로 조정 가능한 시스템으로 설계되어 있다. 대학 과제 수준에서 한 단계 올라간 포인트가 바로 여기에 있다.",
          snippet: `mWalkSpeed = Info->WalkSpeed;
mRunSpeed = Info->RunSpeed;
mDetectRange = Info->DetectRange;
mAttackDistance = Info->AttackDistance;
mGold = Info->Gold;

mMovement->MaxSpeed = mWalkSpeed;

TObjectPtr<AMonsterController> AI = GetController<AMonsterController>();
if (IsValid(AI))
{
    AI->SetDetectRange(mDetectRange);
}`,
        },
        {
          label: "Source Seminar B",
          title: "PossessedBy에서 BT를 연결한다",
          file: "Monster/MonsterNormal.cpp",
          lines: "27-35",
          summary:
            "강의 후반의 '몬스터가 빙의되는 시점에 BT를 등록한다'는 설명이 실제 프로젝트에서는 매우 짧고 명확한 코드로 나타난다. 바로 `PossessedBy` 안에서 `SetAITree`를 호출하는 구조다.",
          thesis:
            "중요한 것은 코드 길이가 아니라 시점이다. AI 라이프사이클을 어느 시점에 끊어 이해할 것인가가 이 장의 핵심이다.",
          snippet: `void AMonsterNormal::PossessedBy(AController* NewController)
{
    UE_LOG(UELOG, Warning, TEXT("Monster PossessedBy"));

    AMonsterController* Ctrl = Cast<AMonsterController>(NewController);
    Ctrl->SetAITree(TEXT("/Game/Monster/BT_Monster_Normal.BT_Monster_Normal"));

    Super::PossessedBy(NewController);
}`,
        },
        {
          label: "Source Seminar C",
          title: "Patrol Task는 Target이 없을 때만 MoveToLocation을 호출한다",
          file: "Monster/BTTask_Patrol.cpp",
          lines: "33-55",
          summary:
            "Patrol 태스크의 초반부를 보면 Blackboard의 `Target` 값을 먼저 읽고, Target이 있으면 바로 빠져나온다. 순찰이 기본 상태이며, 전투 신호가 들어오면 즉시 우선순위를 넘겨준다는 뜻이다.",
          thesis:
            "이 부분은 Behavior Tree의 분기 논리를 코드로 읽는 좋은 예다. Selector의 의미가 추상 용어가 아니라 실제 조건 분기로 드러난다.",
          snippet: `AActor* Target = Cast<AActor>(BlackboardComp->GetValueAsObject(TEXT("Target")));
if (Target)
    return EBTNodeResult::Succeeded;

AMonsterBase* Monster = AIController->GetPawn<AMonsterBase>();
if (!Monster->GetPatrolEnable())
    return EBTNodeResult::Failed;

EPathFollowingRequestResult::Type MoveResult =
    AIController->MoveToLocation(Monster->GetPatrolPoint());

Monster->ChangeAnim(EMonsterNormalAnim::Walk);`,
        },
        {
          label: "Source Seminar D",
          title: "Patrol Task는 도착 판정 후 다음 포인트로 넘어간다",
          file: "Monster/BTTask_Patrol.cpp",
          lines: "81-126",
          summary:
            "Tick 구간은 단순한 진행 확인이 아니다. Target이 생겼는지, Move 상태가 Idle인지, 목표점까지 충분히 가까워졌는지를 체크한 뒤 태스크를 끝낸다. 종료 시 `NextPatrol()`을 호출해 다음 순찰점으로 진행한다.",
          thesis:
            "결국 Patrol은 '한 번 MoveToLocation 한다'가 아니라 '도착과 전투 신호를 동시에 감시하면서 상태를 넘기는 루프'다.",
          snippet: `EPathFollowingStatus::Type PathStatus = AIController->GetMoveStatus();
if (PathStatus == EPathFollowingStatus::Idle)
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}

float Distance = FVector::Dist(MonsterLocation, TargetLocation);
if (Distance <= 5.f)
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}

if (Monster->GetPatrolEnable())
{
    Monster->NextPatrol();
}`,
        },
      ],
      figures: [
        {
          src: "./assets/images/l2-spline-editor.jpg",
          alt: "레벨에서 스플라인 점을 편집하는 장면",
          time: "00:01:34",
          title: "도판 5. 스플라인 편집 화면",
          caption:
            "SpawnPoint를 선택했을 때 경로와 포인트가 보이는 화면이다. 스플라인을 입력 장치로 본다는 강의 관점을 가장 직관적으로 보여 준다.",
        },
        {
          src: "./assets/images/l2-onconstruction.jpg",
          alt: "OnConstruction에서 PatrolPoints를 채우는 코드",
          time: "00:12:55",
          title: "도판 6. OnConstruction에서 배열 갱신",
          caption:
            "스플라인 점을 월드 좌표 배열로 바꾸는 코드 장면이다. 편집용 데이터가 실행용 데이터로 변환되는 정확한 지점이다.",
        },
        {
          src: "./assets/images/l2-looped-path.jpg",
          alt: "레벨에서 루프형 스플라인 경로를 확인하는 장면",
          time: "00:24:40",
          title: "도판 7. 루프형 순찰 경로 확인",
          caption:
            "닫힌 루프 형태의 순찰 경로를 직접 확인하는 장면이다. 왕복과 루프 패턴을 스플라인 하나로 설계할 수 있다는 설명과 연결된다.",
        },
        {
          src: "./assets/images/l2-aitree-loader.jpg",
          alt: "AIController에서 Behavior Tree를 로드하는 코드",
          time: "00:43:40",
          title: "도판 8. SetAITree와 RunBehaviorTree",
          caption:
            "BT 에셋을 받아 로드하고 실행하는 코드 흐름을 보여 주는 장면이다. 강의에서 말한 'BT 등록'이 실제로 어떤 함수들로 이뤄지는지 감을 잡기 좋다.",
        },
        {
          src: "./assets/images/l2-possessedby-setup.jpg",
          alt: "MonsterNormal의 PossessedBy에서 BT를 연결하는 코드",
          time: "00:50:09",
          title: "도판 9. PossessedBy에서 BT 연결",
          caption:
            "몬스터가 빙의되는 시점에 BT 경로를 넘기는 코드 화면이다. 이 장의 핵심 접점을 가장 잘 보여 준다.",
        },
      ],
      labTasks: [
        "스플라인 점을 늘리거나 줄인 뒤 Patrol Task가 순찰 순서를 어떻게 소비하는지 기록한다.",
        "`BT_Monster_Normal`의 Blackboard에서 `Target` 키가 비어 있을 때 Patrol 브랜치가 도는지 확인한다.",
        "`PossessedBy`에서 BT 경로를 다른 에셋으로 바꿨을 때 어떤 차이가 생기는지 비교한다.",
        "`NextPatrol()` 호출 타이밍이 도착 판정과 어떻게 연결되는지 로그로 추적한다.",
      ],
      pitfalls: [
        "PatrolPoints 배열을 만들기만 하고 MonsterBase에 전달하지 않으면 순찰은 절대 시작되지 않는다.",
        "BT 등록 시점을 흐리게 이해하면 Controller가 없는 상태에서 BT를 띄우려다 디버깅이 복잡해진다.",
        "`Target` 키 타입이나 이름이 어긋나면 Selector 분기 자체가 무너진다.",
      ],
      reviewQuestions: [
        "MonsterBase가 DetectRange까지 보유하는 이유는 무엇인가?",
        "왜 `SetAITree`는 MonsterController가 아니라 MonsterNormal의 `PossessedBy`에서 호출되는가?",
        "Patrol Task가 Target을 먼저 읽고 빠져나오는 구조는 상위 Selector와 어떤 관계가 있는가?",
      ],
      takeaway: [
        "스플라인은 사람에게 친화적이고, PatrolPoints는 AI에게 친화적이다.",
        "BT 등록은 추상 개념이 아니라 PossessedBy라는 엔진 시점 위에 놓인다.",
        "Patrol은 기본 상태이며, Target의 출현이 그 상태를 깨는 첫 신호다.",
      ],
      references: [
        "MonsterBase.cpp 175-224",
        "MonsterNormal.cpp 27-35",
        "BTTask_Patrol.cpp 33-55",
        "BTTask_Patrol.cpp 81-126",
      ],
    },
    {
      id: "chapter-targeting",
      displayNo: "03",
      chapterNo: "Chapter III",
      code: "260415_3",
      title: "타겟 인식 및 Move To",
      strap:
        "팀 판정, 시야 감지, Blackboard, MoveToActor를 묶어 실제 추적 가능한 몬스터 AI의 최소 골격을 완성한다.",
      duration: "Lecture Span 00:00:02 - 00:50:35",
      tags: [
        "MonsterController.cpp",
        "BTTask_MonsterTrace.cpp",
        "GameInfo.h",
        "PlayerCharacter.cpp",
      ],
      intro:
        "세 번째 강의는 앞선 두 장에서 준비한 데이터를 실제 추적 AI로 연결하는 단계다. 하지만 소스를 읽어 보면, Move To는 결코 단독 기능이 아니다. MonsterBase의 팀 설정, PlayerCharacter의 팀 설정, MonsterController의 시야 구성, Blackboard의 Target, BTTask_MonsterTrace의 이동 호출이 한 번에 맞물려야 한다. 그래서 이 장은 '왜 AI가 안 움직이는가'를 해부하는 강의이기도 하다.",
      thesis:
        "이 장의 명제는 **감지 코드 하나만 맞춰서는 AI가 완성되지 않는다**는 것이다. `TeamPlayer`, `TeamMonster`, `SightRadius`, `RunBehaviorTree`, `OnTarget`, `MoveToActor`가 하나의 체계로 연결될 때에만 추적이 성립한다.",
      learningGoals: [
        "MonsterController가 어떤 시점에 어떤 감각과 팀 정보를 준비하는지 설명할 수 있다.",
        "`OnTarget`이 Blackboard와 속도 전환을 동시에 갱신하는 이유를 이해할 수 있다.",
        "`MoveToActor`가 실패할 때 Nav Mesh, 팀 ID, BT 실행 여부를 어떤 순서로 점검할지 정리할 수 있다.",
      ],
      sections: [
        {
          title: "1. 출발점은 감지가 아니라 올바른 빙의와 팀 판정이다",
          source: "자막 근거 00:00:55 - 00:09:17",
          body:
            "강의는 의외로 Perception보다 먼저 `AIControllerClass`, `AutoPossessAI`, 그리고 팀 설정을 확인한다. 이 순서가 맞다. 컨트롤러가 제대로 붙지 않았거나 팀 관계가 적대로 설정되지 않았으면 시야가 있어도 감지 이벤트가 들어오지 않는다. 소스에서도 MonsterBase는 `TeamMonster`, PlayerCharacter는 `TeamPlayer`를 명시한다.",
          bullets: [
            "`PlacedInWorldOrSpawned`는 배치 몬스터와 스폰 몬스터를 같은 규칙으로 묶는다.",
            "월드 아웃라이너에서 Controller가 실제로 생성됐는지 확인하는 습관이 중요하다.",
            "Perception 문제처럼 보여도 원인은 팀 설정이나 빙의 시점일 수 있다.",
          ],
        },
        {
          title: "2. OnTarget은 상태 저장과 속도 전환을 동시에 수행한다",
          source: "자막 근거 00:09:17 - 00:21:18",
          body:
            "강의 중반의 핵심은 `OnTarget(AActor*, FAIStimulus)`이다. 감지 성공이면 Blackboard의 `Target`에 액터를 기록하고, 실패면 `nullptr`로 지운다. 동시에 `DetectTarget(true/false)`를 호출해 몬스터 속도를 걷기와 달리기 사이에서 전환한다. 감지와 이동 상태가 같은 함수 안에서 묶이는 구조가 매우 중요하다.",
          bullets: [
            "`Target` 키는 BT 전체를 흔드는 상태 변수다.",
            "속도 전환을 같이 묶어야 추적 체감이 분명하게 바뀐다.",
            "Blackboard가 동작하려면 그 전에 `RunBehaviorTree`가 성공해야 한다.",
          ],
        },
        {
          title: "3. Move To는 Blackboard 값 위에서만 의미를 가진다",
          source: "자막 근거 00:22:26 - 00:35:42",
          body:
            "강의는 Blackboard와 Behavior Tree를 분리해서 설명하지만, 프로젝트를 읽으면 두 시스템은 거의 한 몸처럼 움직인다. `SetAITree`에서 BT가 실행되고, `OnTarget`이 Blackboard를 갱신하며, `BTTask_MonsterTrace`가 그 Target을 읽어 `MoveToActor`를 호출한다. 이 연결 고리가 바로 실제 추적 AI의 골격이다.",
          bullets: [
            "`Target` 값이 존재하면 전투 브랜치가 의미를 가진다.",
            "없으면 Patrol이나 Wait 같은 비전투 브랜치가 의미를 가진다.",
            "따라서 Blackboard는 단순 저장소가 아니라 트리의 실행 방향을 결정하는 중심축이다.",
          ],
        },
        {
          title: "4. Move To가 안 되면 Nav Mesh, 거리, 팀을 함께 본다",
          source: "자막 근거 00:36:16 - 00:50:35",
          body:
            "강의 후반은 사실상 실전 디버깅 교안이다. `MoveToActor`는 호출만으로 끝나지 않는다. 갈 수 있는 Nav Mesh가 있어야 하고, Target이 유효해야 하며, 공격 거리 안에 들어왔을 때 Trace Task가 적절히 종료되어야 한다. UE20252의 Trace Task는 캡슐 높이 보정 후 거리 비교까지 직접 수행한다.",
          bullets: [
            "Nav Mesh Bounds Volume이 없으면 Blackboard와 BT가 멀쩡해도 이동은 실패한다.",
            "Move 상태가 Idle인지, 거리 판정이 너무 타이트하지 않은지 함께 봐야 한다.",
            "추적과 공격의 경계는 `GetAttackDistance()`가 결정한다.",
          ],
        },
      ],
      sourceStudies: [
        {
          label: "Source Seminar A",
          title: "MonsterController 생성자에서 시야와 팀을 준비한다",
          file: "Monster/MonsterController.cpp",
          lines: "13-44",
          summary:
            "실제 컨트롤러는 생성자에서 `UAISenseConfig_Sight`를 만들고, SightRadius, LoseSightRadius, 시야각, 감지 대상 소속을 설정한 뒤 `OnTargetPerceptionUpdated`에 `OnTarget`을 바인딩한다.",
          thesis:
            "즉 Perception은 런타임 즉흥 기능이 아니라 컨트롤러가 태어나는 순간부터 준비되는 기본 능력이다. 강의에서 말한 '감지 구조'가 추상 용어가 아니라 생성자 수준의 초기화라는 점을 보자.",
          snippet: `mSightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("Sight"));
mSightConfig->SightRadius = 800.f;
mSightConfig->LoseSightRadius = 800.f;
mSightConfig->PeripheralVisionAngleDegrees = 180.f;
mSightConfig->DetectionByAffiliation.bDetectEnemies = true;

mAIPerception->ConfigureSense(*mSightConfig);
mAIPerception->SetDominantSense(mSightConfig->GetSenseImplementation());
SetGenericTeamId(FGenericTeamId(TeamMonster));

mAIPerception->OnTargetPerceptionUpdated.AddDynamic(
    this, &AMonsterController::OnTarget);`,
        },
        {
          label: "Source Seminar B",
          title: "SetAITree가 BT를 로드하고 실행한다",
          file: "Monster/MonsterController.cpp",
          lines: "75-98",
          summary:
            "`SetAITree`는 단지 경로를 저장하지 않는다. `TSoftObjectPtr<UBehaviorTree>`를 만들고, 현재 구현에서는 동기 로드 후 `RunBehaviorTree`까지 호출한다. Blackboard 초기화 역시 이 흐름 안에서 함께 준비된다.",
          thesis:
            "강의에서 말한 'BT 등록'은 추상 개념이 아니라 실제 런타임 초기화 절차다. 따라서 추적이 안 되면 `OnTarget`보다 먼저 여기서 BT가 정상 구동됐는지 봐야 한다.",
          snippet: `void AMonsterController::SetAITree(const FString& Path)
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
}`,
        },
        {
          label: "Source Seminar C",
          title: "OnTarget이 Target과 속도를 동시에 갱신한다",
          file: "Monster/MonsterController.cpp",
          lines: "158-187",
          summary:
            "강의 중반부 핵심 설명이 프로젝트 코드에서 가장 명확하게 드러나는 지점이다. 감지 성공 시 `Target`을 채우고 `DetectTarget(true)`를, 실패 시 `Target`을 비우고 `DetectTarget(false)`를 호출한다.",
          thesis:
            "이 함수 하나에 Blackboard 상태와 체감 속도 변화가 동시에 묶여 있기 때문에, 이 장을 이해하면 감지와 이동을 따로따로 보지 않게 된다.",
          snippet: `void AMonsterController::OnTarget(AActor* Actor, FAIStimulus Stimulus)
{
    if (!IsValid(mAITree) || !Blackboard)
        return;

    AMonsterBase* Monster = GetPawn<AMonsterBase>();
    if (!IsValid(Monster))
        return;

    if (Stimulus.WasSuccessfullySensed())
    {
        Blackboard->SetValueAsObject(TEXT("Target"), Actor);
        Monster->DetectTarget(true);
    }
    else
    {
        Blackboard->SetValueAsObject(TEXT("Target"), nullptr);
        Monster->DetectTarget(false);
    }
}`,
        },
        {
          label: "Source Seminar D",
          title: "Trace Task는 MoveToActor와 공격거리 판정을 함께 가진다",
          file: "Monster/BTTask_MonsterTrace.cpp",
          lines: "33-50, 103-123",
          summary:
            "Trace 태스크는 Blackboard의 Target을 읽어 `MoveToActor(Target)`를 호출하고, Tick 중에는 캡슐 높이 보정 후 거리를 계산해 공격 거리 안에 들어왔는지 확인한다. 강의 후반부의 Move To 설명이 실제로 이렇게 구현되어 있다.",
          thesis:
            "Move To는 하나의 노드 이름이 아니라, 타겟 조회, 이동 요청, 애니메이션 전환, 거리 종료 조건이 묶인 복합 행위다.",
          snippet: `AActor* Target = Cast<AActor>(BlackboardComp->GetValueAsObject(TEXT("Target")));
if (!Target)
    return EBTNodeResult::Failed;

EPathFollowingRequestResult::Type MoveResult = AIController->MoveToActor(Target);
Monster->ChangeAnim(EMonsterNormalAnim::Run);

float Distance = FVector::Dist(MonsterLocation, TargetLocation);
if (Distance <= Monster->GetAttackDistance())
{
    FinishLatentTask(OwnerComp, EBTNodeResult::Failed);
}`,
        },
        {
          label: "Source Seminar E",
          title: "팀 ID와 데이터 스키마가 감지 시스템의 전제다",
          file: "GameInfo.h · Player/PlayerCharacter.cpp",
          lines: "GameInfo.h 32-77, PlayerCharacter.cpp 43-47",
          summary:
            "프로젝트 전체에서 `TeamMonster = 30`, `TeamPlayer = 10`이 공용 기준으로 정의되고, PlayerCharacter 역시 시작 시점에 `SetGenericTeamId(FGenericTeamId(TeamPlayer))`를 호출한다. 또한 `FMonsterInfo`에는 DetectRange와 AttackDistance 같은 AI 핵심 파라미터가 들어 있다.",
          thesis:
            "감지와 추적을 이해하려면 MonsterController만 보면 부족하다. 팀 관계와 데이터 스키마를 같이 봐야 비로소 왜 감지 성공/실패가 갈리는지 설명할 수 있다.",
          snippet: `#define TeamNeutral 255
#define TeamMonster 30
#define TeamPlayer  10

struct FMonsterInfo : public FTableRowBase
{
    float WalkSpeed;
    float RunSpeed;
    float DetectRange;
    float AttackDistance;
};

GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
GetMesh()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
SetGenericTeamId(FGenericTeamId(TeamPlayer));`,
        },
      ],
      figures: [
        {
          src: "./assets/images/l3-controller-check.jpg",
          alt: "레벨에서 몬스터와 컨트롤러 상태를 확인하는 장면",
          time: "00:04:21",
          title: "도판 10. 월드에서 먼저 확인할 것",
          caption:
            "레벨에서 몬스터와 배치 상태를 보는 장면이다. 강의는 이 단계에서 Controller 생성 여부부터 확인하라고 강조한다.",
        },
        {
          src: "./assets/images/l3-ontarget-code.jpg",
          alt: "OnTarget 함수의 감지 성공과 실패 분기 코드",
          time: "00:14:52",
          title: "도판 11. OnTarget 분기 작성",
          caption:
            "`Stimulus.WasSuccessfullySensed()`를 기준으로 성공과 실패를 나누는 코드 장면이다. Blackboard Target 갱신의 출발점이다.",
        },
        {
          src: "./assets/images/l3-behavior-tree.jpg",
          alt: "Behavior Tree 에디터에서 Root와 Selector를 확인하는 장면",
          time: "00:22:33",
          title: "도판 12. Behavior Tree 기본 골격",
          caption:
            "BT 에디터에서 Root와 Selector를 두는 장면이다. Target 유무에 따라 전투와 순찰을 나누는 분기 구조를 떠올리기 좋다.",
        },
        {
          src: "./assets/images/l3-navmesh.jpg",
          alt: "레벨에 녹색 Nav Mesh 영역이 보이는 화면",
          time: "00:36:45",
          title: "도판 13. Move To보다 먼저 보는 Nav Mesh",
          caption:
            "녹색 내비게이션 영역을 확인하는 장면이다. 강의 후반부에서 가장 자주 언급되는 실제 실패 원인을 시각적으로 보여 준다.",
        },
        {
          src: "./assets/images/l3-runtime-chase.jpg",
          alt: "실행 중 몬스터 추적을 테스트하는 장면",
          time: "00:47:24",
          title: "도판 14. 추적 체감 테스트",
          caption:
            "추적 결과를 실제 플레이 화면에서 확인하는 장면이다. 이 구간에서 WalkSpeed, RunSpeed, Acceptable Radius의 체감 차이를 관찰할 수 있다.",
        },
      ],
      labTasks: [
        "MonsterController의 DetectRange 값을 조절하고 실제 시야 체감이 어떻게 달라지는지 기록한다.",
        "Nav Mesh를 잠시 제거한 뒤 `MoveToActor` 실패 상황을 재현하고 복구 절차를 정리한다.",
        "`Target`과 `AttackTarget` Blackboard 키가 어떤 상황에서 바뀌는지 로그로 남겨 본다.",
        "`WalkSpeed`와 `RunSpeed` 값을 서로 가깝게 혹은 크게 벌려 추적 체감 차이를 비교한다.",
      ],
      pitfalls: [
        "Controller가 실제로 빙의되지 않았는데 Perception 설정만 만지면 문제의 본질을 놓치기 쉽다.",
        "Target이 들어오는데 이동이 안 된다면 BT 실행, Nav Mesh, 팀 관계를 함께 봐야 한다.",
        "속도 전환이 없으면 추적이 되더라도 AI가 너무 둔하거나 미끄러져 보일 수 있다.",
      ],
      reviewQuestions: [
        "왜 `OnTarget`은 Blackboard 갱신과 속도 전환을 같은 함수 안에서 처리하는가?",
        "`MoveToActor`가 정상이어도 Nav Mesh가 없으면 어떤 현상이 생기는가?",
        "TeamMonster와 TeamPlayer가 감지 성공 여부에 미치는 영향은 무엇인가?",
      ],
      takeaway: [
        "추적 AI는 감지, 상태 저장, 이동, 속도 전환이 동시에 맞물릴 때 성립한다.",
        "`Target`은 Blackboard의 변수이면서 BT 전체의 분기 신호다.",
        "UE20252 프로젝트는 이미 AttackTask와 WaitTask까지 확장되어 있어 이후 과제 방향도 바로 잡을 수 있다.",
      ],
      references: [
        "MonsterController.cpp 13-44",
        "MonsterController.cpp 75-98",
        "MonsterController.cpp 158-187",
        "BTTask_MonsterTrace.cpp 33-50",
        "BTTask_MonsterTrace.cpp 103-123",
        "GameInfo.h 32-77",
        "PlayerCharacter.cpp 43-47",
      ],
    },
  ],
  checklist: [
    "SpawnPoint를 `AActor`로 만들고 `Root`, `Arrow`, `PatrolPath`를 붙였는가",
    "`mSpawnClass`, `mSpawnTime`, `SetSpawnPoint`, `SetPatrolPoints` 흐름을 소스 기준으로 이해했는가",
    "`OnConstruction`에서 스플라인 점이 월드 좌표 `PatrolPoints`로 변환되는지 확인했는가",
    "`MonsterNormal::PossessedBy`에서 BT 경로가 연결되는 시점을 파악했는가",
    "`MonsterController::OnTarget`이 `Target`과 속도 전환을 동시에 갱신하는 이유를 설명할 수 있는가",
    "Nav Mesh, Team ID, DetectRange, AttackDistance를 Move To 디버깅 순서에 포함했는가",
  ],
  glossary: [
    {
      term: "SpawnPoint",
      description:
        "어떤 몬스터를 언제 어디에 만들지 결정하는 레벨 배치용 액터. 260415 강의 전체의 출발점이다.",
    },
    {
      term: "PatrolPath / PatrolPoints",
      description:
        "`PatrolPath`는 에디터에서 만지는 스플라인이고, `PatrolPoints`는 그 결과로 얻는 런타임 좌표 배열이다.",
    },
    {
      term: "PossessedBy",
      description:
        "Pawn이 Controller에 실제로 빙의되는 순간 호출되는 함수. 이 프로젝트에서는 BT 등록의 기준 시점으로 쓰인다.",
    },
    {
      term: "Blackboard Target",
      description:
        "감지된 적 액터를 담는 핵심 키. BT의 전투/비전투 분기를 좌우한다.",
    },
    {
      term: "DetectRange / AttackDistance",
      description:
        "`FMonsterInfo`에서 읽어 오는 데이터 기반 파라미터. 시야와 전투 전환 거리를 결정한다.",
    },
    {
      term: "MoveToLocation / MoveToActor",
      description:
        "순찰과 추적의 핵심 이동 요청 함수. Patrol은 좌표, Trace는 액터를 목표로 삼는다.",
    },
  ],
  seminarQuestions: [
    "SpawnPoint의 `PatrolPath`를 BeginPlay가 아니라 OnConstruction에서 처리한 선택은 편집 경험에 어떤 차이를 만드는가?",
    "`MonsterInfoLoadComplete`에서 `DetectRange`를 AIController에 밀어 넣는 구조는 데이터 중심 설계 관점에서 어떤 장점을 가지는가?",
    "`Target`이 비었을 때 Patrol, 찼을 때 Trace로 흐르는 구조는 Selector 노드의 의미를 어떻게 드러내는가?",
    "`AttackTarget`과 `Target`을 분리하는 방식은 이후 공격 태스크 확장에서 어떤 장점을 줄 수 있는가?",
  ],
  assignments: [
    "과제 1. `BTTask_MonsterWait`를 참고해 SpawnPoint별로 순찰 대기 시간을 다르게 주는 실험을 설계하라.",
    "과제 2. `FMonsterInfo`의 `DetectRange`와 `AttackDistance`를 서로 다른 몬스터 클래스마다 다르게 설정하고 추적 패턴 차이를 비교하라.",
    "과제 3. `BTTask_MonsterAttack`를 읽고 `AttackEnd` 플래그가 어떤 방식으로 애니메이션 노티파이와 이어져야 자연스러운지 설계안을 작성하라.",
    "과제 4. `MonsterController::SetAITree`를 비동기 로드 버전으로 확장할 때 어떤 초기화 순서를 조심해야 하는지 정리하라.",
  ],
};
