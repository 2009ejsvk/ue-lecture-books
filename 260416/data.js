const bookData = {
  course: {
    code: "UE20252 MONSTER AI / 260416",
    title: "260416 몬스터 전투 AI 강의교재",
    subtitle: "Monster AnimInstance, MonsterTrace, MonsterAttack를 하나의 전투 루프로 묶어 읽는 교재형 정리본",
    dossier: [
      { label: "Session", value: "2026-04-16" },
      { label: "Videos", value: "3 lectures / 2h 17m" },
      { label: "Axis", value: "Anim -> Trace -> Attack" },
      { label: "Project", value: "UE20252 / Monster" }
    ],
    abstract:
      "이 문서는 `260416_1_Monster AnimInstance`, `260416_2_Monster Trace Task`, `260416_3_Monster Attack Task`를 한 권의 전투 AI 교재로 다시 엮은 것이다. 자막, 대표 캡처, `D:/UnrealProjects/UE_Academy_Stduy/Source/UE20252` 실제 소스를 함께 대조해 `상태 enum -> 추적 태스크 -> 공격 태스크 -> 노티파이 기반 타격` 흐름을 단계적으로 읽도록 구성했다.",
    method: [
      "`자막`, `도판`, `소스`를 같은 장 안에 겹쳐서 읽는다.",
      "플레이어형 입력 애님과 몬스터형 상태 애님을 대비해서 설명한다.",
      "비헤이비어 트리의 `Failed` 반환을 오류가 아니라 전이 규칙으로 해석한다."
    ],
    outcomes: [
      "`EMonsterNormalAnim`의 역할을 설명할 수 있다.",
      "`BTTask_MonsterTrace`와 `BTTask_MonsterAttack`의 흐름을 분리해서 말할 수 있다.",
      "`AttackTarget`, `AttackEnd`, `AnimNotify`가 어떻게 연결되는지 도식화할 수 있다."
    ],
    audience: [
      "플레이어 구현 다음 단계로 몬스터 전투 AI를 묶어보려는 학습자",
      "비헤이비어 트리 성공/실패 반환값이 헷갈리는 학습자",
      "AnimNotify와 블랙보드를 함께 써서 공격 루프를 만들고 싶은 학습자"
    ]
  },

  roadmap: [
    {
      title: "상태 enum으로 몬스터 애니메이션을 공통화한다",
      code: "260416-1",
      description: "복잡한 입력을 추적하지 않고 `EMonsterNormalAnim` 값을 Anim Blueprint가 읽도록 만든다."
    },
    {
      title: "추적 태스크를 실패 전이 노드로 설계한다",
      code: "260416-2",
      description: "공격 거리 진입 순간 `Failed`를 반환해 Selector의 다음 공격 태스크로 넘긴다."
    },
    {
      title: "공격 노티파이와 블랙보드로 공격 루프를 닫는다",
      code: "260416-3",
      description: "`AttackTarget`과 `AttackEnd`를 나눠 저장해 데미지 시점과 종료 시점을 분리한다."
    }
  ],

  pipeline: [
    {
      title: "DataTable이 이동과 공격 거리의 기준을 준다",
      detail: "`FMonsterInfo`의 `WalkSpeed`, `RunSpeed`, `DetectRange`, `AttackDistance`가 몬스터 인스턴스로 주입된다."
    },
    {
      title: "공용 enum이 애님의 언어가 된다",
      detail: "`EMonsterNormalAnim`은 `Idle`, `Walk`, `Run`, `Attack`, `Death`를 정의하고 C++과 Anim Blueprint가 함께 읽는다."
    },
    {
      title: "Trace 태스크가 추적과 Run 전환을 시작한다",
      detail: "`MoveToActor(Target)`와 `ChangeAnim(Run)`이 같은 `ExecuteTask()`에서 시작된다."
    },
    {
      title: "공격 거리 진입은 실패 반환으로 전환된다",
      detail: "Trace는 공격 거리 안에 들어오면 `Failed`를 반환해 Selector가 Attack 태스크를 열게 만든다."
    },
    {
      title: "Attack 태스크는 대상과 종료 신호를 분리해 관리한다",
      detail: "`AttackTarget`은 실제 타격 대상, `AttackEnd`는 공격 종료 신호다. 노티파이가 값을 올리고 태스크 Tick이 이를 소비한다."
    }
  ],

  sourceAtlas: [
    {
      chapter: "Chapter 1",
      title: "GameInfo.h",
      file: "`GameInfo.h` - monster data + enum",
      role: "전투 데이터와 애니메이션 상태 정의의 공용 헤더.",
      points: [
        "`FMonsterInfo`가 추적/공격 거리의 기준을 보관한다.",
        "`EMonsterNormalAnim`이 공용 상태 집합을 만든다."
      ]
    },
    {
      chapter: "Chapter 1",
      title: "MonsterAnimInstance.h",
      file: "`MonsterAnimInstance.h` - state container",
      role: "`mAnimType`과 노티파이 인터페이스를 가진 공용 애님 인스턴스.",
      points: [
        "`SetAnim()`이 외부 AI 로직의 단일 진입점이다.",
        "여러 몬스터가 같은 구조를 공유할 수 있다."
      ]
    },
    {
      chapter: "Chapter 1",
      title: "MonsterBase.cpp",
      file: "`MonsterBase.cpp` - bridge + runtime data",
      role: "`ChangeAnim()`으로 애님 상태를 넘기고 DataTable 값을 런타임 인스턴스에 적재한다.",
      points: [
        "`bUseControllerRotationYaw = true`가 추적 회전을 보장한다.",
        "`MonsterInfoLoadComplete()`가 사거리와 속도를 채운다."
      ]
    },
    {
      chapter: "Chapter 2",
      title: "BTTask_MonsterTrace.cpp",
      file: "`BTTask_MonsterTrace.cpp` - pursuit task",
      role: "길찾기 시작, Run 전환, 공격 거리 판정, 종료 후 정지를 한 파일에서 책임진다.",
      points: [
        "`MoveToActor()`와 `Run` 전환이 같이 시작된다.",
        "공격 거리 진입은 `Failed` 반환으로 처리된다."
      ]
    },
    {
      chapter: "Chapter 3",
      title: "BTTask_MonsterAttack.cpp",
      file: "`BTTask_MonsterAttack.cpp` - attack loop",
      role: "공격 시작, 종료 신호 감시, 회전 보정, 재추적 분기를 담당한다.",
      points: [
        "`AttackTarget`과 `AttackEnd`를 분리한다.",
        "공격 종료 후 거리 밖이면 다시 Trace로 되돌린다."
      ]
    },
    {
      chapter: "Chapter 3",
      title: "MonsterAnimInstance.cpp / MonsterNormal.cpp",
      file: "`MonsterAnimInstance.cpp`, `MonsterNormal.cpp` - notify to damage",
      role: "노티파이 시점과 실제 데미지 적용 시점을 연결하는 전투 브리지.",
      points: [
        "`AnimNotify_Attack()`가 `NormalAttack()`을 호출한다.",
        "`NormalAttack()`은 `AttackTarget`을 읽어 `TakeDamage()`를 호출한다."
      ]
    }
  ],

  chapters: [
    {
      id: "chapter-1",
      displayNo: "Chapter 01",
      chapterNo: "01",
      code: "260416_1_Monster AnimInstance",
      title: "MonsterAnimInstance: 상태를 애니메이션 언어로 번역하기",
      strap: "플레이어형 입력 추적 대신 이미 결정된 몬스터 상태를 `enum class`로 외부화하는 장.",
      duration: "48m 30s",
      tags: ["`AnimInstance`", "`enum class`", "`Anim Blueprint`", "`Constructor Binding`"],
      intro:
        "일반 몬스터는 플레이어처럼 복잡한 입력을 읽기보다, `가만히 있음`, `추적`, `공격`, `사망` 같은 상태를 애니메이션 쪽에 알려주는 편이 더 단순하다. 강의는 이 관점에서 `MonsterAnimInstance`를 만든다.",
      thesis:
        "`EMonsterNormalAnim`을 공용 언어로 세우고 `MonsterAnimInstance`가 그 값을 보관하게 하면, 여러 몬스터가 같은 구조를 공유하면서도 에셋만 다르게 연결할 수 있다.",
      learningGoals: [
        "`UENUM(BlueprintType)` 기반 상태 enum의 목적을 설명한다.",
        "`MonsterAnimInstance`가 무엇을 보관하는지 정리한다.",
        "배치 액터와 새로 생성된 액터의 반응 차이를 이해한다."
      ],
      sections: [
        {
          title: "일반 몬스터는 상태 기반 애님이 더 적합하다",
          source: "자막 00:00:01 - 00:05:07",
          body: "보스처럼 세밀한 반응이 필요한 경우가 아니라면 일반 몬스터는 상태값 하나만으로도 충분히 자연스러운 애니메이션 전이를 만들 수 있다.",
          bullets: [
            "입력 기반보다 유지보수가 쉽다.",
            "`Idle`, `Run`, `Attack`, `Death`처럼 작은 상태 집합으로 정리된다."
          ]
        },
        {
          title: "공용 enum과 AnimInstance 클래스를 먼저 세운다",
          source: "자막 00:05:08 - 00:18:00 / `GameInfo.h`, `MonsterAnimInstance.h`",
          body: "`GameInfo.h`의 `EMonsterNormalAnim`은 C++와 Anim Blueprint가 함께 읽는 상태 정의이고, `MonsterAnimInstance`의 `mAnimType`은 그 값을 실제로 담는 슬롯이다.",
          bullets: [
            "`SetAnim()`이 외부 태스크의 단일 진입점이다.",
            "Anim Blueprint는 계산자가 아니라 상태 소비자가 된다."
          ]
        },
        {
          title: "종족별 클래스는 Anim Blueprint만 다르게 연결한다",
          source: "자막 00:18:00 - 00:48:30 / `MonsterNormal_MinionWarrior.cpp`",
          body: "전사형, 총잡이형처럼 종족이 달라도 공통 구조는 그대로 두고 생성자에서 각기 다른 Anim Blueprint만 연결한다. 후반부 테스트에서는 배치 액터가 생성자 변경을 즉시 반영하지 않는 이유도 함께 확인한다.",
          bullets: [
            "`FClassFinder<UAnimInstance>`로 종족별 Anim Blueprint를 지정한다.",
            "이미 배치된 액터는 생성자 변경이 바로 안 먹을 수 있다."
          ]
        }
      ],
      sourceStudies: [
        {
          label: "Type System",
          title: "공용 몬스터 상태 enum",
          file: "GameInfo.h",
          lines: "84-90",
          summary: "몬스터 전투 루프가 공유하는 최소 상태 집합.",
          thesis: "이번 강의의 모든 애님 전환은 결국 이 enum 값 변경으로 환원된다.",
          snippet: [
            "UENUM(BlueprintType)",
            "enum class EMonsterNormalAnim : uint8",
            "{",
            "\tIdle,",
            "\tWalk,",
            "\tRun,",
            "\tAttack,",
            "\tDeath",
            "};"
          ].join("\n")
        },
        {
          label: "Anim State",
          title: "MonsterAnimInstance가 상태를 저장한다",
          file: "MonsterAnimInstance.h",
          lines: "16,31-34",
          summary: "`mAnimType`은 Anim Blueprint가 읽는 상태 슬롯이다.",
          thesis: "애님 블루프린트는 상태를 계산하지 않고, 이미 결정된 값을 표현한다.",
          snippet: [
            "EMonsterNormalAnim mAnimType;",
            "",
            "void SetAnim(EMonsterNormalAnim Anim)",
            "{",
            "\tmAnimType = Anim;",
            "}"
          ].join("\n")
        },
        {
          label: "Bridge",
          title: "MonsterBase가 실제 상태 전환을 전달한다",
          file: "MonsterBase.cpp",
          lines: "54-58",
          summary: "태스크는 `MonsterBase::ChangeAnim()`을 통해서만 애님 상태를 바꾼다.",
          thesis: "몬스터 본체를 거치면 태스크와 AnimInstance의 결합을 낮출 수 있다.",
          snippet: [
            "void AMonsterBase::ChangeAnim(EMonsterNormalAnim Anim)",
            "{",
            "\tif (IsValid(mAnimInst))",
            "\t\tmAnimInst->SetAnim(Anim);",
            "}"
          ].join("\n")
        }
      ],
      figures: [
        {
          src: "./assets/images/ch1-animinstance-create.jpg",
          alt: "Monster AnimInstance 생성 장면",
          title: "공용 AnimInstance를 세우는 출발점",
          time: "00:15:08.500",
          caption: "몬스터용 공통 상태 컨테이너를 도입하는 시점으로 읽으면 된다."
        },
        {
          src: "./assets/images/ch1-animbp-graph.jpg",
          alt: "Anim Blueprint 그래프 연결 장면",
          title: "Anim Blueprint가 상태값을 소비하도록 맞추는 단계",
          time: "00:36:08.000",
          caption: "그래프와 전이 규칙을 `mAnimType` 기반으로 정리하는 장면."
        },
        {
          src: "./assets/images/ch1-world-test.jpg",
          alt: "월드 테스트 장면",
          title: "배치 액터 반영 문제를 확인하는 월드 테스트",
          time: "00:42:50.000",
          caption: "생성자 수정이 미리 배치된 액터에 즉시 안 먹을 수 있음을 보여준다."
        }
      ],
      labTasks: [
        "`EMonsterNormalAnim`과 `MonsterAnimInstance`를 만든다.",
        "`SetAnim()`으로 외부 태스크가 값을 밀어 넣게 한다.",
        "종족별 생성자에서 Anim Blueprint를 연결한다."
      ],
      pitfalls: [
        "`enum class`와 `UENUM(BlueprintType)`를 빼면 블루프린트 연동이 불편해진다.",
        "이미 배치된 액터는 생성자 변경을 즉시 반영하지 않을 수 있다."
      ],
      reviewQuestions: [
        "왜 일반 몬스터는 입력 기반보다 상태 기반 애님이 유리한가?",
        "배치 액터와 새 스폰 액터의 차이는 왜 생기는가?"
      ],
      takeaway: [
        "몬스터 애님은 입력 해석보다 상태 번역 계층으로 두는 편이 단순하다.",
        "공용 enum이 있으면 종족 차이는 에셋 연결로 밀어낼 수 있다."
      ],
      references: [
        "`GameInfo.h:84-90`",
        "`MonsterAnimInstance.h:16,31-34`",
        "`MonsterBase.cpp:54-58`"
      ]
    },
    {
      id: "chapter-2",
      displayNo: "Chapter 02",
      chapterNo: "02",
      code: "260416_2_Monster Trace Task",
      title: "MonsterTrace: 실패를 이용해 다음 단계로 넘어가기",
      strap: "추적 태스크를 단순 이동 노드가 아니라 공격 단계로 넘기는 전이 노드로 읽는 장.",
      duration: "43m 49s",
      tags: ["`BTTaskNode`", "`ExecuteTask`", "`TickTask`", "`FinishLatentTask`", "`MoveToActor`"],
      intro:
        "두 번째 강의는 기본 `MoveTo` 대신 C++ 태스크를 직접 상속해 추적 로직을 만든다. 핵심은 언제 끝나고 어떤 결과값으로 끝나야 다음 공격 단계가 열리는지를 스스로 설계하는 데 있다.",
      thesis:
        "Trace 태스크는 '추적 성공'을 보고하는 노드가 아니라, 공격 거리 진입 순간 `Failed`를 반환해 Selector의 다음 공격 노드가 열리게 만드는 전이 장치다.",
      learningGoals: [
        "`ExecuteTask`, `TickTask`, `OnTaskFinished`의 역할을 구분한다.",
        "`MoveToActor()`와 `Run` 전환이 왜 같은 시점에 묶이는지 설명한다.",
        "왜 공격 거리 진입 시 `Failed`를 반환해야 하는지 설명한다."
      ],
      sections: [
        {
          title: "태스크의 시작, 갱신, 종료를 분리한다",
          source: "자막 00:00:16 - 00:06:00 / `BTTask_MonsterTrace.h`",
          body: "`UBTTaskNode`를 상속하면 시작은 `ExecuteTask`, 매 프레임 감시는 `TickTask`, 종료 정리는 `OnTaskFinished`로 나눌 수 있다.",
          bullets: [
            "추적은 장기 작업이므로 Tick이 필요하다.",
            "이동 정리는 종료 콜백에 두는 편이 자연스럽다."
          ]
        },
        {
          title: "MoveToActor와 Run 애님을 동시에 건다",
          source: "자막 00:10:00 - 00:20:00 / `BTTask_MonsterTrace.cpp`",
          body: "`ExecuteTask()`는 블랙보드의 `Target`을 읽고 `MoveToActor(Target)`를 호출한 뒤, 곧바로 `Run` 애님으로 전환한다.",
          bullets: [
            "길찾기와 시각 상태가 같은 태스크 안에서 시작된다.",
            "`InProgress`를 반환해 Tick 단계로 넘어간다."
          ]
        },
        {
          title: "공격 거리 진입은 의도된 실패다",
          source: "자막 00:32:00 - 00:43:49 / Selector 설명",
          body: "공격 거리 안에 들어오면 Trace 태스크는 성공이 아니라 실패로 끝난다. 현재 트리는 Selector 구조이므로, 앞 단계가 실패해야 다음 자식인 Attack 태스크가 열린다.",
          bullets: [
            "`Failed`는 오류가 아니라 전이 규칙이다.",
            "`bUseControllerRotationYaw = true`가 추적 회전을 실제 폰에 전달한다."
          ]
        }
      ],
      sourceStudies: [
        {
          label: "Lifecycle",
          title: "추적 태스크는 Tick과 Finished 콜백을 모두 켠다",
          file: "BTTask_MonsterTrace.cpp",
          lines: "8-15",
          summary: "`NodeName`, `bNotifyTick`, `bNotifyTaskFinished`가 기본 수명주기를 확장한다.",
          thesis: "추적은 한 번의 호출로 끝나는 작업이 아니라 계속 감시해야 하는 노드다.",
          snippet: [
            "UBTTask_MonsterTrace::UBTTask_MonsterTrace()",
            "{",
            "\tNodeName = TEXT(\"MonsterTrace\");",
            "\tbNotifyTick = true;",
            "\tbNotifyTaskFinished = true;",
            "}"
          ].join("\n")
        },
        {
          label: "Execute",
          title: "MoveToActor와 Run 전환이 같은 시작점에 묶인다",
          file: "BTTask_MonsterTrace.cpp",
          lines: "17-52",
          summary: "길찾기와 애니메이션 전환이 같은 `ExecuteTask()` 안에서 시작된다.",
          thesis: "태스크 시작 시점에 시각 상태도 함께 바뀌어야 몬스터의 의도가 보인다.",
          snippet: [
            "EPathFollowingRequestResult::Type MoveResult = AIController->MoveToActor(Target);",
            "if (MoveResult == EPathFollowingRequestResult::Failed)",
            "\treturn EBTNodeResult::Failed;",
            "",
            "Monster->ChangeAnim(EMonsterNormalAnim::Run);",
            "return EBTNodeResult::InProgress;"
          ].join("\n")
        },
        {
          label: "Transition",
          title: "공격 거리 진입 시 Failed를 반환한다",
          file: "BTTask_MonsterTrace.cpp",
          lines: "94-124",
          summary: "PathStatus가 `Idle`이거나 공격 거리 안에 들어오면 태스크는 `Failed`로 끝난다.",
          thesis: "현재 Selector 구조에서는 실패가 곧 다음 공격 단계 진입 조건이다.",
          snippet: [
            "if (PathStatus == EPathFollowingStatus::Idle)",
            "\tFinishLatentTask(OwnerComp, EBTNodeResult::Failed);",
            "",
            "float Distance = FVector::Dist(MonsterLocation, TargetLocation);",
            "if (Distance <= Monster->GetAttackDistance())",
            "\tFinishLatentTask(OwnerComp, EBTNodeResult::Failed);"
          ].join("\n")
        }
      ],
      figures: [
        {
          src: "./assets/images/ch2-task-result-enum.jpg",
          alt: "EBTNodeResult 열람 장면",
          title: "태스크 반환값부터 확인하는 장면",
          time: "00:08:03.500",
          caption: "`Succeeded`, `Failed`, `InProgress`가 분기 자체를 바꾼다는 점을 확인하는 화면."
        },
        {
          src: "./assets/images/ch2-movetoactor-code.jpg",
          alt: "MoveToActor 코드 장면",
          title: "MoveToActor를 직접 호출하는 코드 화면",
          time: "00:14:55.500",
          caption: "기본 노드 대신 직접 만든 추적 태스크가 길찾기를 책임지는 순간."
        },
        {
          src: "./assets/images/ch2-runtime-trace.jpg",
          alt: "추적 테스트 장면",
          title: "레벨에서 추적과 회전을 검증하는 장면",
          time: "00:41:53.500",
          caption: "`bUseControllerRotationYaw`의 필요성이 실제 월드 테스트에서 드러난다."
        }
      ],
      labTasks: [
        "`BTTask_MonsterTrace`를 만들고 Tick/Finished를 켠다.",
        "`MoveToActor()`와 `Run` 전환을 `ExecuteTask()`에 넣는다.",
        "공격 거리 진입 시 `Failed`를 반환하게 만든다."
      ],
      pitfalls: [
        "공격 거리 진입 시 `Succeeded`를 반환하면 Selector가 다음 공격 태스크를 열지 못한다.",
        "컨트롤러만 회전하고 폰이 회전하지 않으면 추적이 미끄러져 보인다."
      ],
      reviewQuestions: [
        "Trace 태스크가 왜 `Failed`를 반환해야 하는가?",
        "`InProgress` 이후 `TickTask()`는 어떤 역할을 맡는가?"
      ],
      takeaway: [
        "이번 장의 핵심은 추적 그 자체보다 전이 규칙 설계다.",
        "`Failed`는 비헤이비어 트리에서 종종 가장 중요한 성공 조건이다."
      ],
      references: [
        "`BTTask_MonsterTrace.cpp:8-15`",
        "`BTTask_MonsterTrace.cpp:17-52`",
        "`BTTask_MonsterTrace.cpp:94-124`"
      ]
    },
    {
      id: "chapter-3",
      displayNo: "Chapter 03",
      chapterNo: "03",
      code: "260416_3_Monster Attack Task",
      title: "MonsterAttack: 공격 노티파이와 블랙보드로 루프를 닫기",
      strap: "공격 태스크를 즉시 타격 노드가 아니라 공격 유지 노드로 읽는 장.",
      duration: "45m 03s",
      tags: ["`AnimNotify`", "`AttackTarget`", "`AttackEnd`", "`GetTargetRotatorYaw`", "`TakeDamage`"],
      intro:
        "세 번째 강의는 Trace 다음 단계로 Attack 태스크를 만든다. 공격은 단순 데미지 호출이 아니라 공격 애니메이션 재생, 실제 타격 프레임, 공격 종료, 종료 후 재추적 여부까지 포함하는 작은 상태기계로 읽어야 한다.",
      thesis:
        "`AttackTarget`과 `AttackEnd`를 블랙보드에서 분리하고, AnimNotify로 데미지 시점과 종료 시점을 나누면 공격 루프가 흔들리지 않는다.",
      learningGoals: [
        "`AttackTarget`과 `AttackEnd`의 역할을 구분한다.",
        "`AnimNotify_Attack()`과 `AnimNotify_AttackEnd()`의 차이를 설명한다.",
        "공격 종료 후 재추적 여부가 어떻게 결정되는지 설명한다."
      ],
      sections: [
        {
          title: "공격 태스크는 공격 문맥을 먼저 세팅한다",
          source: "자막 00:00:04 - 00:05:18 / `BTTask_MonsterAttack.cpp`",
          body: "Attack 태스크는 Trace와 비슷한 뼈대를 재사용하지만, 이동 대신 `Attack` 애님 전환과 `AttackTarget` 저장에 집중한다.",
          bullets: [
            "데미지는 여기서 바로 주지 않는다.",
            "먼저 공격 대상을 블랙보드에 고정한다."
          ]
        },
        {
          title: "AnimNotify가 타격 시점과 종료 시점을 분리한다",
          source: "자막 00:16:00 - 00:31:00 / `MonsterAnimInstance.cpp`",
          body: "실제 맞는 프레임에는 `AnimNotify_Attack()`이, 공격이 끝난 뒤에는 `AnimNotify_AttackEnd()`가 호출된다. 따라서 데미지 처리와 루프 종료 판단이 서로 분리된다.",
          bullets: [
            "노티파이는 애니메이션 길이를 존중하는 가장 간단한 방법이다.",
            "`AttackEnd` bool은 Attack 태스크 Tick이 읽는 종료 신호다."
          ]
        },
        {
          title: "공격이 끝난 뒤에만 재추적 여부를 판단한다",
          source: "자막 00:39:00 - 00:45:03 / `BTTask_MonsterAttack.cpp`",
          body: "공격 도중에 곧바로 Trace로 튀면 몬스터가 흔들려 보인다. 그래서 Attack 태스크는 `AttackEnd`가 참일 때만 거리를 다시 계산하고, 멀어졌으면 실패로 끝내 Trace로 보내고, 아직 가까우면 회전만 보정한다.",
          bullets: [
            "거리 밖이면 `Failed`로 끝나 재추적으로 넘어간다.",
            "거리 안이면 `GetTargetRotatorYaw()`로 타깃을 다시 보게 만든다."
          ]
        }
      ],
      sourceStudies: [
        {
          label: "Notify",
          title: "AnimNotify가 공격과 종료 신호를 나눠 보낸다",
          file: "MonsterAnimInstance.cpp",
          lines: "18-31",
          summary: "`AnimNotify_Attack()`은 `NormalAttack()`을, `AnimNotify_AttackEnd()`는 블랙보드 `AttackEnd` 갱신을 담당한다.",
          thesis: "애니메이션 시점과 태스크 종료 시점을 분리해야 공격 루프가 자연스럽다.",
          snippet: [
            "void UMonsterAnimInstance::AnimNotify_Attack()",
            "{",
            "\tMonster->NormalAttack();",
            "}",
            "",
            "void UMonsterAnimInstance::AnimNotify_AttackEnd()",
            "{",
            "\tAIController->GetBlackboardComponent()->SetValueAsBool(TEXT(\"AttackEnd\"), true);",
            "}"
          ].join("\n")
        },
        {
          label: "Attack Start",
          title: "Attack 태스크는 애님과 대상을 함께 설정한다",
          file: "BTTask_MonsterAttack.cpp",
          lines: "17-49",
          summary: "`Attack` 애님으로 바꾸고 `AttackTarget`을 블랙보드에 저장한다.",
          thesis: "공격 태스크의 첫 역할은 데미지가 아니라 공격 문맥 세팅이다.",
          snippet: [
            "Monster->ChangeAnim(EMonsterNormalAnim::Attack);",
            "BlackboardComp->SetValueAsObject(TEXT(\"AttackTarget\"), Target);",
            "return EBTNodeResult::InProgress;"
          ].join("\n")
        },
        {
          label: "Attack Loop",
          title: "AttackEnd 이후에만 거리와 회전을 재판단한다",
          file: "BTTask_MonsterAttack.cpp",
          lines: "92-129",
          summary: "`AttackEnd`가 올라오면 사거리 밖인지 검사하고, 가까우면 회전만 보정한다.",
          thesis: "공격 모션이 끝나기 전에는 공격 상태를 유지해야 루프가 흔들리지 않는다.",
          snippet: [
            "bool AttackEnd = BlackboardComp->GetValueAsBool(TEXT(\"AttackEnd\"));",
            "if (AttackEnd)",
            "{",
            "\tBlackboardComp->SetValueAsBool(TEXT(\"AttackEnd\"), false);",
            "\tif (Distance > Monster->GetAttackDistance())",
            "\t\tFinishLatentTask(OwnerComp, EBTNodeResult::Failed);",
            "\telse",
            "\t\tMonster->SetActorRotation(GetTargetRotatorYaw(TargetLocation, MonsterLocation));",
            "}"
          ].join("\n")
        },
        {
          label: "Damage",
          title: "NormalAttack는 블랙보드 대상을 실제로 타격한다",
          file: "MonsterNormal.cpp",
          lines: "43-56",
          summary: "`AttackTarget`을 읽어 `TakeDamage()`를 호출한다.",
          thesis: "태스크는 문맥을 세팅하고, 노티파이는 타이밍을 알려주고, 몬스터 클래스가 실제 행위를 수행한다.",
          snippet: [
            "AActor* Target = Cast<AActor>(",
            "\tAIController->GetBlackboardComponent()->GetValueAsObject(TEXT(\"AttackTarget\")));",
            "if (Target)",
            "{",
            "\tFDamageEvent DmgEvent;",
            "\tTarget->TakeDamage(mAttack, DmgEvent, GetController(), this);",
            "}"
          ].join("\n")
        }
      ],
      figures: [
        {
          src: "./assets/images/ch3-notify-timeline.jpg",
          alt: "공격 애니메이션 노티파이 타임라인",
          title: "공격 노티파이를 심는 타임라인",
          time: "00:21:47.500",
          caption: "데미지 프레임과 종료 프레임을 분리해 두는 장면."
        },
        {
          src: "./assets/images/ch3-attack-task-code.jpg",
          alt: "공격 태스크 코드 장면",
          title: "Attack 태스크가 공격 문맥을 세팅하는 코드",
          time: "00:30:05.000",
          caption: "`AttackTarget`과 `Attack` 애님 전환이 같이 잡히는 시점."
        },
        {
          src: "./assets/images/ch3-attack-preview.jpg",
          alt: "공격 애니메이션 프리뷰 장면",
          title: "공격 모션과 종료 지점을 확인하는 프리뷰",
          time: "00:35:42.500",
          caption: "`AttackEnd`를 언제 세워야 하는지 감각적으로 보여준다."
        },
        {
          src: "./assets/images/ch3-bt-branch.jpg",
          alt: "비헤이비어 트리 공격 분기 장면",
          title: "Trace 다음에 Attack이 이어지는 트리 분기",
          time: "00:44:07.500",
          caption: "Trace의 실패가 곧 Attack 진입이라는 설계를 도식적으로 보여준다."
        }
      ],
      labTasks: [
        "`BTTask_MonsterAttack`에서 `AttackTarget`과 `Attack` 애님을 세팅한다.",
        "`AnimNotify_Attack`, `AnimNotify_AttackEnd`를 연결한다.",
        "공격 종료 후 사거리 밖이면 재추적하도록 만든다."
      ],
      pitfalls: [
        "공격 태스크 안에서 즉시 데미지를 주면 애니메이션 타이밍과 판정이 어긋난다.",
        "`AttackEnd`를 별도 bool로 두지 않으면 공격 도중에도 추적으로 튈 수 있다."
      ],
      reviewQuestions: [
        "`AttackTarget`과 `AttackEnd`는 왜 분리되어야 하는가?",
        "공격 종료 후 회전 보정이 필요한 이유는 무엇인가?"
      ],
      takeaway: [
        "공격 태스크의 핵심은 데미지 자체보다 공격 루프의 문맥과 종료 조건 유지다.",
        "AnimNotify, Blackboard, Monster 클래스가 역할을 나눠 가지면 전투 루프가 안정적이다."
      ],
      references: [
        "`MonsterAnimInstance.cpp:18-31`",
        "`BTTask_MonsterAttack.cpp:17-49`",
        "`BTTask_MonsterAttack.cpp:92-129`",
        "`MonsterNormal.cpp:43-56`"
      ]
    }
  ],

  glossary: [
    {
      term: "EMonsterNormalAnim",
      description: "몬스터 공용 애니메이션 상태 enum. 이번 강의에서는 `Idle`, `Walk`, `Run`, `Attack`, `Death` 다섯 값이 핵심이다."
    },
    {
      term: "FinishLatentTask",
      description: "Tick으로 돌고 있는 BTTask를 명시적으로 끝낼 때 쓰는 함수. 여기서는 `Failed`가 다음 전이를 여는 역할을 한다."
    },
    {
      term: "AttackTarget",
      description: "공격 노티파이 시점에 실제 데미지를 줄 대상을 저장하는 블랙보드 키."
    },
    {
      term: "AttackEnd",
      description: "공격 모션 종료를 알리는 블랙보드 bool. Attack 태스크는 이 값이 `true`일 때만 재판단한다."
    },
    {
      term: "AnimNotify",
      description: "애니메이션의 특정 프레임에서 코드 함수를 호출하게 하는 장치. 이번 강의에서는 실제 타격과 종료 신호를 나눠 보낸다."
    }
  ],

  checklist: [
    "`EMonsterNormalAnim`과 `FMonsterInfo`의 역할을 구분해서 설명할 수 있는가?",
    "Trace 태스크가 왜 `Failed`를 반환해야 하는지 Selector 구조와 함께 설명할 수 있는가?",
    "`AttackTarget`, `AttackEnd`, `AnimNotify`가 각각 어느 함수에서 쓰이는지 말할 수 있는가?",
    "공격 종료 후 왜 회전 보정이나 재추적 판단이 필요한지 설명할 수 있는가?"
  ],

  seminarQuestions: [
    "보스 몬스터처럼 더 세밀한 패턴이 필요해지면 `MonsterAnimInstance` 구조를 어디까지 공통으로 둘 것인가?",
    "Trace 태스크를 Sequence 아래에 둘 경우 성공/실패 반환 규칙은 어떻게 달라져야 하는가?",
    "원거리 몬스터를 추가해도 `AttackTarget`/`AttackEnd` 구조를 그대로 유지할 수 있는가?"
  ],

  assignments: [
    "과제 A. `MonsterNormal_MinionGunner` 기준으로 원거리 공격 버전을 설계하라.",
    "과제 B. Trace 태스크가 `Succeeded`를 반환하도록 바꿨을 때 트리 실행이 어떻게 달라지는지 기록하라.",
    "과제 C. `AttackEnd` 대신 다른 종료 이벤트를 쓰는 대안을 조사하고 장단점을 비교하라."
  ]
};
