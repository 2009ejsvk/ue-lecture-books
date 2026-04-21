---
title: 260414 몬스터 AI 기반 구축
---

# 260414 몬스터 AI 기반 구축

## 문서 개요

이 문서는 `260414_1`부터 `260414_4`까지의 강의를 하나의 연속된 교재로 다시 엮은 것이다.
이번 날짜의 핵심은 몬스터 AI를 "행동"부터 만들지 않고, 그 행동이 올라갈 바닥 구조를 먼저 세우는 데 있다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`MonsterBase -> AIController / Perception -> Behavior Tree / Blackboard -> DataTable -> AssetManager`

즉 이 날의 수업은 전투 연출이나 애니메이션보다 앞단에 있는 기반 설계에 집중한다.
몬스터를 어떤 부모 클래스로 만들지, 네비게이션 위를 어떻게 움직이게 할지, 적을 감지하면 어떤 컨트롤러가 블랙보드를 갱신할지, 능력치 데이터는 어디에 두고 어떤 방식으로 읽어 올지를 차례대로 연결한다.

이 교재는 아래 세 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상 및 자막
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스

## 학습 목표

- `MonsterBase`를 `Character`가 아니라 `Pawn`으로 시작한 이유를 설명할 수 있다.
- `AIController`, `AIPerception`, `NavMesh`가 각각 어떤 책임을 가지는지 구분할 수 있다.
- `Behavior Tree`, `Blackboard`, `MonsterState` 인터페이스, `FMonsterInfo` 데이터 구조의 역할을 연결해서 말할 수 있다.
- `AssetManager`와 `GameInstanceSubsystem`을 이용해 몬스터 데이터를 비동기로 읽는 흐름을 정리할 수 있다.

## 강의 흐름 요약

1. 몬스터는 `Pawn`을 기반으로 직접 컴포넌트를 조립하고, AI가 빙의되기 쉬운 구조를 먼저 만든다.
2. 레벨에는 `Nav Mesh Bounds Volume`을 배치하고, `MonsterController`는 시야 감각과 타겟 갱신 로직을 맡는다.
3. 몬스터 능력치와 상태는 `Blackboard`, `MonsterState` 인터페이스, `FMonsterInfo` 데이터 구조를 통해 정리된다.
4. 마지막으로 `PrimaryDataAsset`, `AssetManager`, `AssetGameInstanceSubsystem`을 이용해 데이터 테이블을 중앙에서 로드한다.

---

## 제1장. MonsterBase: Pawn으로 시작하는 몬스터 본체

### 1.1 왜 Character가 아니라 Pawn인가

첫 강의의 중요한 판단은 몬스터를 `ACharacter`로 시작하지 않는다는 점이다.
`Character`는 이미 이동, 캡슐, 메시, 캐릭터 무브먼트 같은 요소를 풍부하게 제공하지만, 그만큼 기본 전제가 많다.
이번 강의는 몬스터 AI를 학습하는 과정이므로, 어떤 컴포넌트가 왜 필요한지 직접 조립하며 이해하는 편이 더 낫다고 본다.

그래서 `MonsterBase`는 `Pawn`을 상속하고, 필요한 것만 명시적으로 붙인다.
이 선택 덕분에 이후 강의에서 `UCapsuleComponent`, `USkeletalMeshComponent`, `UFloatingPawnMovement`의 역할을 각각 분리해서 볼 수 있다.

![MonsterBase 클래스 생성](./assets/images/monsterbase-class-create.jpg)

### 1.2 Body, Mesh, Movement를 직접 조립하는 구조

실제 소스를 보면 `MonsterBase`는 다음과 같이 몬스터 본체를 구성한다.

- `mBody`: 충돌과 피격 기준이 되는 캡슐
- `mMesh`: 실제 스켈레탈 메시
- `mMovement`: `Pawn`을 이동시키는 최소 이동 컴포넌트

```cpp
mBody = CreateDefaultSubobject<UCapsuleComponent>(TEXT("Body"));
SetRootComponent(mBody);

mMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("Mesh"));
mMesh->SetupAttachment(mBody);

mMovement = CreateDefaultSubobject<UFloatingPawnMovement>(TEXT("Movement"));
```

강의에서 이 구성이 중요한 이유는 몬스터를 "보이는 모델"이 아니라 "움직이고 감지되는 엔티티"로 다시 이해하게 만들기 때문이다.
`Mesh`만 있으면 장면에는 보이지만, 충돌이 없으면 공격 판정과 탐색 기준이 흔들린다.
반대로 `Body`만 있고 메시가 없으면 디버깅 객체에 가깝다.
이 둘 위에 `Movement`가 올라가야 비로소 AI가 월드 안에서 이동하는 주체가 된다.

![MonsterBase 컴포넌트 구성](./assets/images/monsterbase-components.jpg)

### 1.3 네비게이션을 오염시키지 않는 기본 설정

강의 중간에 지나가듯 언급되지만 실제로 매우 중요한 설정이 있다.
바로 몬스터의 캡슐이 네비게이션 생성에 영향을 주지 않게 하는 부분이다.

```cpp
mBody->SetCanEverAffectNavigation(false);
AIControllerClass = AMonsterController::StaticClass();
AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;
bUseControllerRotationYaw = true;
```

여기에는 네 가지 핵심 판단이 들어 있다.

- 몬스터 자신은 길을 찾는 주체이지, NavMesh를 다시 굽는 장애물로 다루지 않는다.
- 몬스터는 `AMonsterController`가 빙의하는 구조를 기본값으로 가진다.
- 레벨 배치든 런타임 스폰이든 AI가 자동으로 붙도록 한다.
- 회전은 컨트롤러가 잡고, 몬스터 본체는 그 회전을 따른다.

![MonsterBase 네비게이션 관련 설정](./assets/images/monsterbase-nav-setting.jpg)

이 장면은 나중에 디버깅할 때도 매우 중요하다.
NavMesh가 이상하게 다시 계산되거나, 몬스터가 생성됐는데 움직이지 않거나, 정면 회전이 어색할 때 대부분 이 초기 설정으로 다시 돌아오게 된다.

### 1.4 MonsterBase는 이후 모든 장의 공통 기반이다

이 시점에서는 아직 전투도, 순찰도, 추적도 완성되지 않았다.
하지만 `MonsterBase`가 먼저 단단하게 서 있기 때문에 이후 장에서 올라가는 모든 AI 로직이 안정적으로 붙을 수 있다.

정리하면 `MonsterBase`는 단순한 부모 클래스가 아니라 다음 요소를 한 번에 묶는 기반 클래스다.

- 월드 안에서 움직이는 폰
- AIController가 빙의되는 대상
- 메시와 충돌을 가진 전투 엔티티
- 이후 데이터 테이블 값을 주입받는 런타임 객체

### 1.5 장 정리

제1장의 결론은 단순하다.
몬스터 AI를 잘 만들려면 행동 트리보다 먼저 몬스터 본체의 책임을 명확하게 만들어야 한다.
이번 강의는 `Pawn` 기반 조립을 통해 그 바닥을 깔고 있다.

---

## 제2장. AIController와 AIPerception: 움직이고 인식하는 기반

### 2.1 NavMesh는 AI 이동을 위한 전제 조건이다

두 번째 강의에서 가장 먼저 확인하는 것은 코드가 아니라 레벨 환경이다.
AI가 이동하려면 엔진은 먼저 "어디를 걸을 수 있는지"를 알아야 하고, 그 정보가 바로 `NavMesh`다.

강의에서는 `Nav Mesh Bounds Volume`을 레벨에 배치하고, `P` 키를 눌러 초록색 영역으로 이동 가능 범위를 시각화한다.
이 과정은 단순한 엔진 기능 소개가 아니라, 이후 `MoveToLocation`, `MoveToActor`가 왜 실패하는지를 추적하는 첫 번째 디버깅 단계다.

![Nav Mesh Bounds Volume 배치](./assets/images/navmesh-bounds-volume.jpg)

![NavMesh 미리보기](./assets/images/navmesh-preview-green.jpg)

NavMesh를 볼 때 같이 점검해야 할 항목은 다음과 같다.

- 몬스터가 실제로 서 있는 바닥이 초록 영역 안에 있는가
- 목표 지점도 네비게이션 영역에 포함되는가
- 동적 생성이 필요한 맵인지, 정적 베이크면 충분한지

강의는 여기서 "코드가 맞아도 길이 없으면 AI는 가지 못한다"는 점을 반복해서 보여 준다.

### 2.2 MonsterController는 몬스터의 감각과 판단 창구다

`MonsterBase`가 몸체라면, `MonsterController`는 판단을 담당하는 두뇌다.
실제 소스에서는 컨트롤러 생성자에서 지각 시스템을 준비한다.

```cpp
mAIPerception = CreateDefaultSubobject<UAIPerceptionComponent>(TEXT("AIPerception"));
mSightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("Sight"));

mSightConfig->SightRadius = 800.f;
mSightConfig->LoseSightRadius = 900.f;
mSightConfig->PeripheralVisionAngleDegrees = 90.f;

mAIPerception->ConfigureSense(*mSightConfig);
mAIPerception->OnTargetPerceptionUpdated.AddDynamic(
    this, &AMonsterController::OnTarget);
```

이 구조는 매우 교재적이다.
감각 컴포넌트는 "누가 보였는가"를 알려 주고, 컨트롤러는 그 신호를 현재 몬스터의 행동 상태에 맞게 번역한다.
즉 Perception은 감지기이고, 판단은 여전히 컨트롤러가 맡는다.

![AIController와 Perception 설정](./assets/images/aicontroller-perception.jpg)

### 2.3 OnTarget은 Blackboard와 몬스터 상태를 잇는 연결점이다

강의 후반부에서 중요한 함수는 `OnTarget(AActor*, FAIStimulus)`다.
이 함수는 단순히 적을 찾았다고 로그를 찍는 용도가 아니다.
실제 프로젝트에서는 감지 성공 여부에 따라 블랙보드의 `Target` 값을 갱신하고, 몬스터 본체 쪽에도 `DetectTarget(true/false)`를 전달한다.

이 연결이 중요한 이유는 다음과 같다.

- Perception 이벤트는 감지 사실만 알려 준다.
- 블랙보드는 Behavior Tree가 읽는 기억 공간이다.
- 몬스터 본체는 이동 속도나 전투 상태 전환 같은 실제 반응을 가진다.

따라서 `OnTarget`은 센서, 기억, 행동을 이어 주는 접합부다.
이 함수가 정확히 동작해야 다음 단계인 추적과 공격 태스크가 의미를 가진다.

### 2.4 AI 디버깅은 "감지 설정"보다 "빙의와 팀 설정"부터 본다

강의를 듣다 보면 시야 거리나 주변 시야각 같은 숫자에 먼저 눈이 가기 쉽다.
하지만 실제로 문제를 추적할 때는 그보다 앞선 조건을 먼저 봐야 한다.

1. `AIControllerClass`가 올바른 컨트롤러를 가리키는가
2. `AutoPossessAI`가 스폰/배치 상황에 맞게 설정되어 있는가
3. 플레이어와 몬스터의 팀 관계가 적대로 맞물리는가
4. NavMesh 위에서 실제로 이동 명령이 가능한가

이 순서가 중요한 이유는, 감지 문제처럼 보이는 현상도 사실은 빙의 실패나 팀 판정 문제인 경우가 많기 때문이다.
강의가 엔진 도구와 C++ 설정을 번갈아 보여 주는 이유도 바로 이 디버깅 관점 때문이다.

### 2.5 장 정리

제2장은 AI가 "생각하기 전에 먼저 보고 움직일 수 있어야 한다"는 사실을 정리한다.
NavMesh는 이동의 바닥을 만들고, `MonsterController`는 감각과 판단의 중심이 되며, `OnTarget`은 그 결과를 블랙보드와 몬스터 상태로 연결한다.

---

## 제3장. Behavior Tree, Blackboard, MonsterState, DataTable

### 3.1 Blackboard는 AI의 기억 공간이다

세 번째 강의에서 비로소 Behavior Tree와 Blackboard가 등장한다.
여기서 중요한 것은 트리의 모양보다 블랙보드의 의미를 먼저 이해하는 것이다.

블랙보드는 AI가 공유해서 읽는 기억 공간이다.
현재 타겟이 누구인지, 순찰 지점이 어디인지, 공격 가능한 거리 안으로 들어왔는지 같은 정보가 여기에 담긴다.
Behavior Tree는 그 기억을 읽고 다음 행동을 결정하는 실행 그래프다.

![Behavior Tree와 Blackboard 생성](./assets/images/behaviortree-blackboard-assets.jpg)

강의에서 블랙보드 상속까지 언급하는 이유도 같다.
공통 기억 공간을 부모 블랙보드에 두면, 일반 몬스터와 특수 몬스터가 같은 구조 위에서 조금씩 다른 행동만 덧붙일 수 있다.

### 3.2 MonsterState 인터페이스는 "몬스터가 알아야 하는 값"을 추상화한다

이번 날짜 강의의 또 다른 핵심은 `MonsterState` 인터페이스다.
몹마다 공격력, 방어력, 체력, 이동 속도, 감지 거리, 공격 거리 같은 값은 다르지만, AI가 필요로 하는 데이터의 종류는 거의 비슷하다.
그래서 강의는 공통 인터페이스를 둬서 이 값을 한곳으로 모은다.

예를 들어 다음과 같은 항목들이 핵심이다.

- `Attack`
- `Defense`
- `HP`, `HPMax`
- `WalkSpeed`, `RunSpeed`
- `DetectRange`
- `AttackDistance`

![MonsterState 인터페이스 생성](./assets/images/monsterstate-interface.jpg)

이 설계의 장점은 명확하다.
Behavior Tree나 태스크 코드가 "이 몬스터가 어떤 구체 클래스인가"를 과도하게 알 필요가 없어진다.
필요한 전투/이동 값을 인터페이스를 통해 받아 쓰면 되기 때문이다.

### 3.3 FMonsterInfo는 몬스터 데이터를 코드 밖으로 끌어낸다

강의는 상태값을 인터페이스로만 끝내지 않고, 실제 수치가 모이는 구조체도 같이 설계한다.
`GameInfo.h`에 정의된 `FMonsterInfo`는 몬스터 이름, 레벨, 경험치, 공격력, 방어력, 체력, 속도, 감지 거리, 공격 거리, 골드 같은 값을 한데 묶는다.

이 구조체가 중요한 이유는 능력치를 코드 하드코딩에서 떼어 내기 때문이다.
몬스터 하나를 바꾸기 위해 C++를 다시 수정하는 대신, 데이터 테이블을 통해 값을 관리할 수 있게 된다.

이 시점에서 몬스터 시스템의 레이어는 다음처럼 정리된다.

- `MonsterBase`: 런타임 객체
- `MonsterState`: 런타임에서 참조할 인터페이스
- `FMonsterInfo`: 에디터와 데이터 테이블이 공급하는 능력치 묶음

즉 클래스와 데이터가 분리되기 시작한다.

### 3.4 Behavior Tree는 데이터가 있어야 비로소 살아 움직인다

강의에서 BT와 Blackboard를 만드는 장면은 화려해 보이지만, 실제로는 데이터가 들어오지 않으면 비어 있는 그래프에 가깝다.
블랙보드 키가 어떤 의미를 가지는지, 몬스터가 어느 거리에서 추적하고 어느 거리에서 공격하는지는 결국 앞에서 만든 인터페이스와 데이터 구조가 공급한다.

그래서 제3장의 핵심은 "Behavior Tree를 만든다"가 아니다.
"Behavior Tree가 읽을 수 있는 기억과 수치를 함께 만든다"가 더 정확한 표현이다.

### 3.5 장 정리

제3장은 몬스터 AI를 규칙 기반으로 조직하는 장이다.
Blackboard는 기억 공간, Behavior Tree는 실행 구조, `MonsterState`는 공통 인터페이스, `FMonsterInfo`는 데이터 원천 역할을 맡는다.
이 네 가지가 합쳐져야 이후 순찰과 전투 태스크가 일관된 기준으로 동작한다.

---

## 제4장. AssetManager와 데이터 로딩 구조

### 4.1 왜 DataTable만 두고 끝내지 않는가

네 번째 강의는 언뜻 보면 자산 로딩 테크닉을 다루는 보너스 파트처럼 보인다.
하지만 실제로는 이전 장에서 만든 데이터 구조를 프로젝트 전체에서 안정적으로 공유하기 위한 마지막 퍼즐이다.

그냥 `LoadObject`로 데이터 테이블을 바로 읽을 수도 있지만, 강의는 더 관리 가능한 구조를 선택한다.
바로 `UPrimaryDataAsset`과 `AssetManager`를 이용하는 방식이다.

![MonsterInfo Primary Data Asset 생성](./assets/images/pda-monsterinfo-asset.jpg)

`UMonsterInfoTableAsset`은 몬스터 데이터 테이블을 직접 들고 있지 않고, `TSoftObjectPtr<UDataTable>`로 참조한다.
이렇게 하면 필요 시점에 로드할 수 있고, 에셋 매니저를 통한 관리도 쉬워진다.

### 4.2 AssetGameInstanceSubsystem은 데이터 접근 창구를 하나로 모은다

실제 소스를 보면 `UAssetGameInstanceSubsystem`이 몬스터 데이터 로딩을 담당한다.
핵심 흐름은 다음과 같다.

1. `FPrimaryAssetId("MonsterInfoTableAsset", "PDA_MonsterInfo")`를 만든다.
2. `UAssetManager::LoadPrimaryAsset`로 비동기 로드를 요청한다.
3. 콜백에서 `UMonsterInfoTableAsset`을 얻는다.
4. 내부의 `TSoftObjectPtr<UDataTable>`를 실제 테이블로 읽는다.
5. 이후 `FindMonsterInfo`로 몬스터 데이터를 조회한다.

```cpp
FPrimaryAssetId Id(TEXT("MonsterInfoTableAsset"), TEXT("PDA_MonsterInfo"));

Manager->LoadPrimaryAsset(
    Id,
    TArray<FName>(),
    FStreamableDelegate::CreateUObject(
        this, &UAssetGameInstanceSubsystem::LoadComplete));
```

![AssetManager 비동기 로딩 코드](./assets/images/assetmanager-async-load.jpg)

이 구조의 장점은 접근 경로가 하나로 모인다는 점이다.
몬스터 개별 클래스가 제각기 데이터 테이블을 찾으러 다니지 않고, 서브시스템이 중앙 로딩 창구 역할을 맡는다.

### 4.3 MonsterBase는 데이터가 아직 없을 수도 있다는 사실을 고려한다

이 장에서 특히 좋은 부분은 "로딩이 이미 끝났을 것"이라고 단정하지 않는 태도다.
`MonsterBase`는 필요한 몬스터 정보를 즉시 찾을 수 있으면 바로 적용하지만, 아직 로딩 중이면 델리게이트에 등록한 뒤 완료 시점에 다시 세팅한다.

이런 구조는 실무에서 매우 중요하다.
프로젝트가 커질수록 초기화 순서는 늘 복잡해지고, 데이터를 무조건 동기적으로 가정하면 로드 타이밍 버그가 쉽게 생긴다.
강의가 서브시스템과 델리게이트를 같이 보여 주는 이유도 여기에 있다.

### 4.4 프로젝트 설정과 에셋 등록이 끝점이 아니라 시작점이다

`AssetManager` 구조는 코드만 짠다고 끝나지 않는다.
프로젝트 세팅에서 `Primary Asset Types to Scan`에 적절한 타입을 등록하고, 실제 데이터 자산 이름과 타입 문자열이 맞아야 한다.

즉 이 장은 코드 강의이면서도 동시에 프로젝트 운영 강의다.
에셋 이름 하나가 다르면 전체 로딩 흐름이 끊기고, 그 결과 몬스터는 능력치를 받지 못한 채 동작 이상을 보일 수 있다.

### 4.5 장 정리

제4장의 결론은 분명하다.
AI 시스템은 행동 코드만으로 완성되지 않는다.
그 행동이 읽을 수 있는 데이터를 안정적으로 로드하고 공유하는 구조까지 갖춰져야 비로소 프로젝트 수준의 시스템이 된다.

---

## 전체 정리

`260414`는 몬스터 AI의 골격을 세우는 날이다.
이번 날짜에서 만든 것들을 층으로 다시 정리하면 다음과 같다.

1. `MonsterBase`가 몬스터의 물리적 본체를 만든다.
2. `MonsterController`와 `AIPerception`이 감각과 판단의 입구를 만든다.
3. `Behavior Tree`, `Blackboard`, `MonsterState`, `FMonsterInfo`가 행동 규칙과 데이터 기준을 만든다.
4. `AssetManager`와 `AssetGameInstanceSubsystem`이 그 데이터를 안정적으로 공급한다.

이 네 층이 있어야 이후 강의의 순찰, 추적, 공격, 애니메이션 루프가 자연스럽게 올라갈 수 있다.

## 복습 체크리스트

- `MonsterBase`를 `Pawn`으로 시작한 이유를 설명할 수 있는가
- `mBody`, `mMesh`, `mMovement`가 각각 어떤 책임을 가지는지 구분할 수 있는가
- `Nav Mesh Bounds Volume`과 `P` 미리보기의 의미를 설명할 수 있는가
- `OnTarget`이 블랙보드와 몬스터 상태를 어떻게 연결하는지 말할 수 있는가
- `MonsterState` 인터페이스와 `FMonsterInfo` 구조체의 차이를 설명할 수 있는가
- `PrimaryDataAsset`과 `AssetGameInstanceSubsystem`을 왜 함께 쓰는지 정리할 수 있는가

## 세미나 질문

1. `Character` 대신 `Pawn`을 고른 선택은 학습용 프로젝트와 실전 프로젝트에서 각각 어떤 장단점을 가질까
2. Perception 문제를 디버깅할 때 왜 시야 반경보다 빙의와 팀 설정을 먼저 확인해야 할까
3. 몬스터 데이터를 코드가 아니라 데이터 테이블과 에셋 매니저로 분리했을 때 유지보수성이 어떻게 달라질까
4. 서브시스템 없이 각 몬스터가 직접 데이터 테이블을 로드하게 하면 어떤 중복과 타이밍 문제가 생길까

## 권장 과제

1. `MonsterBase` 파생 클래스를 하나 더 만들고, 다른 `FMonsterInfo` 행을 연결해 속도와 감지 거리 차이를 비교해 본다.
2. `MonsterController`의 시야 설정을 조절해 감지 반응이 어떻게 달라지는지 기록한다.
3. 블랙보드에 `HomeLocation`이나 `PatrolIndex` 같은 키를 더 추가해 이후 순찰 태스크 확장을 준비한다.
4. `AssetGameInstanceSubsystem`에 로드 실패 로그를 보강해 에셋 타입 문자열 오류를 쉽게 찾을 수 있게 만든다.
