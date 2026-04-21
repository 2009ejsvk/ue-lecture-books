---
title: 260406 플레이어를 C++ 클래스로 옮기고 GameMode와 입력 자산을 연결하는 기초
---

# 260406 플레이어를 C++ 클래스로 옮기고 GameMode와 입력 자산을 연결하는 기초

## 문서 개요

이 문서는 `260406_1`부터 `260406_3`까지의 강의를 하나의 연속된 교재로 다시 정리한 것이다.
이번 날짜의 핵심은 블루프린트로만 다루던 플레이어를 C++의 기본 클래스와 파생 클래스 구조로 옮기고, 입력 시스템과 조작 루프까지 코드 쪽으로 끌어오는 데 있다.
그리고 이번 정리본에서는 여기에 더해, 현재 프로젝트 `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252` 안의 실제 C++ 코드를 함께 읽으면서 `PlayerCharacter`, `Shinbi`, `DefaultGameMode`, `InputData`, `MainPlayerController`가 어떤 식으로 맞물리는지도 자세히 연결한다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`PlayerCharacter 기반 클래스 생성 -> Shinbi 파생 캐릭터 연결 -> InputData 자산화 -> Rotation / Jump / Attack 입력 구현 -> 실제 C++ 코드로 다시 읽기`

즉 `260406`은 이후 애니메이션, 콤보, 몬스터 AI 강의보다 먼저 읽혀야 하는 플레이어 구조의 출발점이다.
이 날짜에서 플레이어 클래스의 틀과 입력 파이프라인이 잡히기 때문에, 뒤의 `260407` 애니메이션 파트는 이 구조 위에서 자연스럽게 이어진다.

이 교재는 아래 네 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상과 자막
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`의 소스/블루프린트 덤프

## 학습 목표

- 언리얼 클래스와 일반 C++ 클래스의 차이를 설명할 수 있다.
- `APlayerCharacter`를 공통 플레이어 베이스로 두고 `AShinbi` 같은 파생 클래스로 외형과 개별 동작을 붙이는 이유를 말할 수 있다.
- `UDefaultInputData`가 `InputMappingContext`와 `InputAction`을 어디에 모으고, 왜 `CDO`를 통해 꺼내 쓰는지 설명할 수 있다.
- `BeginPlay()`와 `SetupPlayerInputComponent()`가 Enhanced Input 파이프라인에서 각각 어떤 역할을 맡는지 구분할 수 있다.
- `RotationKey`, `JumpKey`, `AttackKey`가 이후 애니메이션/전투 시스템으로 넘어가기 전에 어떤 기본 동작을 완성하는지 설명할 수 있다.
- `APlayerCharacter`, `AShinbi`, `ADefaultGameMode`, `AMainPlayerController`, `UDefaultInputData` 코드를 보고 `260406` 구조가 실제 C++에서 어떻게 보이는지 읽을 수 있다.

## 강의 흐름 요약

1. 에디터에서 새 C++ 클래스를 만들고, 블루프린트 플레이어를 대체할 `APlayerCharacter`를 세운다.
2. 공통 기능은 `APlayerCharacter`에 두고, 외형과 개별 동작은 `AShinbi`, `AWraith` 같은 파생 클래스에 분리한다.
3. `ADefaultGameMode`에서 `DefaultPawnClass`와 `PlayerControllerClass`를 지정해 실제 플레이어 진입점을 C++ 클래스로 바꾼다.
4. 입력 에셋은 `UDefaultInputData`에 모으고, `BeginPlay()`에서 `MappingContext`를 등록한 뒤 `SetupPlayerInputComponent()`에서 액션을 바인딩한다.
5. 마지막으로 `Rotation`, `Jump`, `Attack` 입력을 C++ 함수에 연결해 다음 애니메이션 파트가 기대하는 기본 조작 루프를 완성한다.
6. 현재 프로젝트의 실제 C++ 코드를 읽으며, 위 구조가 `PlayerCharacter`, `Shinbi`, `DefaultGameMode`, `MainPlayerController`, `InputData` 안에서 어떻게 정리되었는지 확인한다.

---

## 제1장. PlayerCharacter와 Shinbi: 블루프린트 플레이어를 C++ 계층으로 바꾸기

### 1.1 언리얼 클래스는 엔진이 관리하는 객체다

첫 강의는 단순히 "클래스 하나 만들기"로 시작하지 않는다.
왜 플레이어를 일반 C++ 클래스가 아니라 언리얼 클래스 계열로 만들어야 하는지부터 짚고 들어간다.
자막에서도 `UObject`를 상속하는 언리얼 클래스는 리플렉션과 가비지 컬렉션의 대상이 되고, 일반 C++ 클래스는 그런 엔진 관리 대상이 아니라는 점을 분명히 설명한다.

이 구분은 생각보다 중요하다.
플레이어 캐릭터는 월드에 배치되고, 에디터 디테일 패널에 노출되고, 블루프린트와도 상호작용해야 한다.
따라서 단순한 유틸리티 객체가 아니라 언리얼 엔진의 객체 생태계 안에 있어야 한다.

강의가 `Character` 기반 클래스를 고른 이유도 여기에 있다.
`Character`는 이미 캡슐, 메시, 이동 컴포넌트 같은 플레이어에 필요한 기본 구조를 갖추고 있으므로, 수업의 초점을 "플레이어 구성"에 둘 수 있다.

![새 C++ 클래스 생성 메뉴](./assets/images/playerclass-wizard.jpg)

### 1.2 APlayerCharacter는 공통 플레이어 기능을 모으는 베이스 클래스다

실제 프로젝트의 공통 베이스는 `APlayerCharacter`다.
이 클래스는 시점 구성, 입력 바인딩, 점프, 공격 진입점처럼 캐릭터가 달라도 거의 유지되는 기능을 한곳에 모아 둔다.
즉 강의의 의도는 "Shinbi를 바로 코드로 만들기"보다, 나중에 다른 영웅이 늘어나도 재사용할 수 있는 플레이어 틀을 만드는 데 있다.

생성자만 봐도 그 성격이 드러난다.

```cpp
mSpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("Arm"));
mSpringArm->SetupAttachment(GetMesh());
mSpringArm->TargetArmLength = 200.f;
mSpringArm->SetRelativeLocation(FVector(0.0, 0.0, 150.0));
mSpringArm->SetRelativeRotation(FRotator(-10.0, 90.0, 0.0));

mCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
mCamera->SetupAttachment(mSpringArm);

bUseControllerRotationYaw = true;
GetCharacterMovement()->JumpZVelocity = 700.f;
GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
```

여기서 중요한 점은 두 가지다.

- 블루프린트에서 보던 시점 세팅과 체크박스 설정이 결국 C++ 생성자 코드로 옮겨졌다는 점
- 이 설정이 특정 영웅의 외형과는 무관한 "플레이어 공통부"라는 점

이 공통부는 이전 블루프린트 프로토타입과도 정확히 이어진다.
`BPPlayer` 덤프를 보면 부모 클래스가 이미 `Character`이고, 상속된 `CapsuleComponent`, `CharacterMovement`, `Mesh` 위에 `SpringArm`, `Camera`를 추가해 쓰고 있다.
즉 `260406`은 완전히 새 플레이어를 만드는 날이라기보다, `BPPlayer`에서 먼저 실험하던 카메라와 이동 구성을 `APlayerCharacter`라는 재사용 가능한 C++ 베이스로 승격시키는 전환점이라고 보는 편이 정확하다.

![PlayerCharacter 생성자 세팅](./assets/images/playerclass-ctor-setup.jpg)

### 1.3 공통부와 개별부를 나누면 파생 클래스가 쉬워진다

강의는 여기서 한 번 더 구조를 분리한다.
공통 기능은 `APlayerCharacter`에 두되, 실제 플레이 가능한 영웅은 `AShinbi`, `AWraith` 같은 파생 클래스로 만든다.
이렇게 하면 입력과 카메라, 점프, 공격 인터페이스는 재사용하고, 캐릭터별 메시나 애니메이션 클래스, 스킬 동작만 따로 바꿀 수 있다.

`AShinbi` 생성자는 정확히 그 역할만 맡고 있다.

```cpp
static ConstructorHelpers::FObjectFinder<USkeletalMesh> MeshAsset(
    TEXT("/Script/Engine.SkeletalMesh'/Game/ParagonShinbi/Characters/Heroes/Shinbi/Skins/Tier_1/Shinbi_Dynasty/Meshes/ShinbiDynasty.ShinbiDynasty'"));

if (MeshAsset.Succeeded())
    GetMesh()->SetSkeletalMeshAsset(MeshAsset.Object);

GetCapsuleComponent()->SetCapsuleHalfHeight(95.f);
GetCapsuleComponent()->SetCapsuleRadius(28.f);
GetMesh()->SetRelativeLocation(FVector(0.0, 0.0, -95.0));
GetMesh()->SetRelativeRotation(FRotator(0.0, -90.0, 0.0));
```

즉 `APlayerCharacter`가 "움직이고 입력받는 몸체"라면, `AShinbi`는 그 몸체에 실제 외형과 영웅별 세부 동작을 입히는 단계라고 볼 수 있다.
현재 소스와 덤프 기준으로는 여기서 한 걸음 더 나아가, `AShinbi`가 `ABPShinbiTemplate` 애니메이션 블루프린트 클래스까지 생성자에서 연결하고 `InputAttack()`, `Skill1()`, `NormalAttack()` 같은 영웅별 동작 함수도 직접 오버라이드한다.
즉 파생 클래스의 책임은 "메시만 바꾸는 것"이 아니라, 외형과 애니메이션 세트, 그리고 개별 전투 동작까지 한데 묶는 것이다.

### 1.4 ConstructorHelpers는 생성자 단계에서 에셋을 묶어 오는 도구다

자막에서 반복해서 강조되는 키워드가 `ConstructorHelpers`다.
이 계열은 이름 그대로 "생성자에서" 에셋을 찾아 붙일 때 사용하는 도구다.
강의가 이 개념을 길게 설명하는 이유는, 플레이어의 외형 지정이 단순 값 대입이 아니라 "에셋 경로를 코드로 고정해 로딩하는 일"이기 때문이다.

이 관점은 이후 `InputData`로 넘어갈 때도 그대로 유지된다.
즉 `ConstructorHelpers`는 메시를 붙일 때만 쓰는 요령이 아니라, 프로젝트 안의 자산을 C++ 클래스 생성자에서 안정적으로 엮는 기본 패턴이다.

![Shinbi 메시와 애님 클래스 연결](./assets/images/shinbi-mesh-setup.jpg)

### 1.5 장 정리

제1장의 결론은 분명하다.
플레이어는 처음부터 개별 영웅 클래스 하나로 시작하기보다, `APlayerCharacter` 같은 공통 베이스와 `AShinbi` 같은 파생 클래스로 나누는 편이 훨씬 낫다.
이 구조가 있어야 이후 입력, 애니메이션, 공격, 스킬이 공통부와 개별부로 자연스럽게 분리된다.

---

## 제2장. DefaultGameMode와 InputData: 플레이어와 입력 자산의 진입점을 C++로 고정하기

### 2.1 GameMode가 실제 플레이어 클래스를 결정한다

두 번째 강의는 단순한 입력 바인딩보다 먼저, "지금 게임이 어떤 플레이어를 스폰하느냐"를 코드 쪽으로 옮긴다.
블루프린트 디폴트 클래스에 맡기던 부분을 `ADefaultGameMode` 생성자에서 명시적으로 고정하는 것이다.

실제 소스는 아주 짧지만 의미가 크다.

```cpp
DefaultPawnClass = AShinbi::StaticClass();
//DefaultPawnClass = AWraith::StaticClass();

PlayerControllerClass = AMainPlayerController::StaticClass();
```

이 코드는 강의가 지향하는 구조를 잘 보여 준다.

- 플레이어 본체는 `AShinbi`
- 입력과 마우스 커서, 피킹은 `AMainPlayerController`
- 이 둘의 조합을 월드 진입점에서 확정하는 위치는 `GameMode`

여기서 한 가지를 분리해서 보는 것이 중요하다.
이전 날짜의 테스트용 블루프린트인 `BPMainGameMode` 덤프는 아직 `DefaultPawnClass = BPTestPlayer`, `PlayerControllerClass = Engine.PlayerController` 상태다.
반면 `260406`의 `ADefaultGameMode`는 이 진입점을 `AShinbi + AMainPlayerController` 조합으로 코드에서 고정한다.
즉 이번 날짜의 의미는 단순히 플레이어를 C++로 옮기는 데 그치지 않고, "프로젝트가 기본으로 어떤 플레이어와 어떤 컨트롤러를 쓰는가"까지 C++ 쪽으로 승격시키는 데 있다.

즉 `DefaultPawnClass`는 단순 옵션이 아니라, "이 프로젝트에서 지금 누가 기본 플레이어인가"를 선언하는 자리다.

![DefaultGameMode에서 Shinbi 선택](./assets/images/defaultgamemode-shinbi.jpg)

현재 `AMainPlayerController` 구현도 비어 있지 않다.
생성자에서는 `bShowMouseCursor = true`로 마우스 커서를 켜고, `BeginPlay()`에서는 `FInputModeGameAndUI`를 적용하며, `Tick()`에서는 `GetHitResultUnderCursor()`로 커서 아래 위치를 계속 피킹한다.
즉 `PlayerControllerClass`를 따로 지정하는 이유는 단순 possession 때문만이 아니라, 이후 스킬 타게팅이나 클릭 기반 상호작용에 필요한 커서 문맥을 플레이어 본체와 분리하기 위해서다.

### 2.2 C++ 클래스 삭제 절차를 따로 설명하는 이유

강의 초반이 클래스 삭제 절차로 시작하는 것도 인상적이다.
언리얼 C++ 클래스는 콘텐츠 브라우저에서 지운다고 끝나는 것이 아니라, 에디터 종료, 소스 파일 삭제, 프로젝트 파일 재생성, 재컴파일 순서를 거쳐야 완전히 정리된다.

이 파트는 자칫 사소해 보이지만, 실제 작업에서는 매우 중요하다.
언리얼 C++는 에디터와 빌드 시스템, 생성된 프로젝트 파일이 연결돼 있기 때문에 "파일만 지우면 끝"이라는 일반 스크립트 감각이 통하지 않는다.
강의가 이 절차를 먼저 짚는 이유는, 입력 시스템처럼 클래스를 계속 추가하고 수정하는 날일수록 정리 절차를 알아야 시행착오가 줄기 때문이다.

### 2.3 UDefaultInputData는 입력 자산의 창고다

이 날짜의 핵심 설계 포인트는 입력을 캐릭터 클래스 안에 흩뿌리지 않고 `UDefaultInputData`에 모은다는 점이다.
자막에서도 "이동과 점프 같은 입력은 캐릭터가 달라도 거의 공통"이라고 말하는데, 실제 소스 구조도 정확히 그 철학을 따른다.

헤더를 보면 이 클래스는 `InputMappingContext` 하나와, 이름으로 찾을 수 있는 `InputAction` 맵을 가진다.

```cpp
UCLASS()
class UE20252_API UInputData : public UObject
{
    GENERATED_BODY()

public:
    TObjectPtr<UInputMappingContext> mContext;

protected:
    TMap<FString, TObjectPtr<UInputAction>> mActions;

public:
    TObjectPtr<UInputAction> FindAction(const FString& Name) const;
};
```

구조가 단순한 대신 효과는 크다.
플레이어 클래스는 에셋 경로를 일일이 알 필요 없이 `"Move"`, `"Rotation"`, `"Jump"` 같은 이름으로 액션을 요청하면 된다.
즉 입력 에셋 관리와 실제 입력 처리 로직이 분리된다.

### 2.4 ConstructorHelpers는 입력 자산에도 같은 방식으로 적용된다

`UDefaultInputData` 생성자는 이 강의의 의도를 가장 잘 보여 주는 코드다.
메시를 붙일 때와 마찬가지로, 입력 자산도 생성자에서 전부 불러와 맵에 저장해 둔다.

```cpp
static ConstructorHelpers::FObjectFinder<UInputMappingContext> InputContext(
    TEXT("/Script/EnhancedInput.InputMappingContext'/Game/Input/IMC_Default.IMC_Default'"));
if (InputContext.Succeeded())
    mContext = InputContext.Object;

static ConstructorHelpers::FObjectFinder<UInputAction> MoveAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Move.IA_Move'"));
if (MoveAction.Succeeded())
    mActions.Add(TEXT("Move"), MoveAction.Object);

static ConstructorHelpers::FObjectFinder<UInputAction> RotationAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Rotation.IA_Rotation'"));
if (RotationAction.Succeeded())
    mActions.Add(TEXT("Rotation"), RotationAction.Object);
```

현재 프로젝트 기준으로는 `Move`, `Rotation`, `Jump`, `Attack`, `Skill1`까지 등록돼 있다.
즉 이 날짜는 기본 이동만 옮긴 것이 아니라, 이후 전투 입력까지 염두에 둔 입력 자산 테이블을 미리 만들어 둔 셈이다.

이 비교는 블루프린트 단계와 나란히 놓고 보면 더 잘 보인다.
`BPPlayer` 덤프의 `BeginPlay` 그래프는 `EnhancedInputLocalPlayerSubsystem`에 `IMC_Shoot`를 직접 등록한다.
반면 현재 C++ 구조는 `IMC_Default`와 각 `IA_*` 자산을 `UDefaultInputData`에 모아 두고, 플레이어 쪽에서는 그 묶음을 읽어 온다.
즉 `260406`은 입력 기능을 추가하는 날이면서 동시에, 입력 에셋 경로를 플레이어 클래스 바깥으로 정리하는 구조화 단계이기도 하다.

![입력 에셋 묶음과 Input 폴더](./assets/images/inputdata-constructor.jpg)

### 2.5 BeginPlay는 MappingContext 등록, SetupPlayerInputComponent는 함수 연결이다

Enhanced Input 파이프라인은 보통 두 단계로 나뉜다.
`BeginPlay()`에서 컨텍스트를 서브시스템에 등록하고, `SetupPlayerInputComponent()`에서 액션을 실제 함수와 연결한다.
`APlayerCharacter`는 이 구조를 아주 정석적으로 구현한다.

먼저 `BeginPlay()`는 로컬 플레이어 서브시스템에 `mContext`를 등록한다.

```cpp
TObjectPtr<UEnhancedInputLocalPlayerSubsystem> Subsystem =
    ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PlayerController->GetLocalPlayer());

const UDefaultInputData* InputData = GetDefault<UDefaultInputData>();
Subsystem->AddMappingContext(InputData->mContext, 0);
```

여기서 중요한 포인트는 `GetDefault<UDefaultInputData>()`다.
자막에도 나오듯, 이 클래스는 `CDO`를 통해 기본 객체가 이미 준비되어 있으므로, 플레이어는 거기서 입력 자산을 읽어 오면 된다.
실제 `InputData.cpp` 주석도 "CDO가 기본으로 생성되며 입력 에셋들은 모두 로딩이 되어 있는 상태이므로 필요하면 CDO를 이용해서 이 에셋에 접근해서 사용한다"라고 설명한다.
블루프린트에서는 `MappingContext`를 그래프 노드에 직접 꽂아 쓰는 경우가 많지만, 여기서는 그 참조를 CDO 쪽으로 모아 두었기 때문에 캐릭터 클래스가 에셋 경로 세부사항을 덜 알게 된다.

![BeginPlay에서 MappingContext 등록](./assets/images/mappingcontext-beginplay.jpg)

### 2.6 액션 바인딩은 이제 이름 기반 조회로 단순해진다

`SetupPlayerInputComponent()` 쪽에서는 `FindAction()`으로 액션을 찾아 각 함수에 바인딩한다.

```cpp
Input->BindAction(InputData->FindAction(TEXT("Move")), ETriggerEvent::Triggered,
    this, &APlayerCharacter::MoveKey);

Input->BindAction(InputData->FindAction(TEXT("Rotation")), ETriggerEvent::Triggered,
    this, &APlayerCharacter::RotationKey);

Input->BindAction(InputData->FindAction(TEXT("Jump")), ETriggerEvent::Started,
    this, &APlayerCharacter::JumpKey);

Input->BindAction(InputData->FindAction(TEXT("Attack")), ETriggerEvent::Started,
    this, &APlayerCharacter::AttackKey);
```

이 구조의 장점은 분명하다.

- 입력 에셋 경로는 `InputData`가 관리한다.
- 플레이어는 어떤 액션이 어떤 함수로 이어지는지만 선언한다.
- 나중에 캐릭터별 스킬 입력이 늘어나도 공통 구조를 쉽게 유지할 수 있다.

즉 `260406`의 입력 시스템 강의는 단순한 C++ 문법 설명이 아니라, 입력 자산과 플레이어 클래스를 느슨하게 연결하는 설계 훈련이라고 볼 수 있다.

![SetupPlayerInputComponent 바인딩](./assets/images/bindaction-setup.jpg)

### 2.7 장 정리

제2장의 핵심은 "입력도 자산이고, 자산은 클래스에서 한 번 정리해 쓰는 편이 낫다"는 점이다.
`ADefaultGameMode`가 플레이어 진입점을 정하고, `UDefaultInputData`가 입력 자산의 창고가 되며, `BeginPlay()`와 `SetupPlayerInputComponent()`가 등록과 바인딩을 나눠 맡는다.

---

## 제3장. Rotation, Jump, Attack: 애니메이션 직전의 기본 조작 루프 완성

### 3.1 260406은 애니메이션 직전의 마지막 조작 강의다

세 번째 강의 자막은 이 날짜의 위치를 아주 명확하게 말해 준다.
이제 막 달리기, 점프, 공격 같은 기본 플레이어 동작이 갖춰져야 다음 시간의 애니메이션 블루프린트와 노티파이 시스템이 자연스럽게 연결될 수 있다는 것이다.

즉 `260406`의 마지막 파트는 전투 시스템 완성 강의가 아니라, 애니메이션 강의가 요구하는 최소한의 조작 루프를 미리 만드는 단계다.
현재 코드와 덤프를 함께 보면 이동 입력도 이 전환의 일부라는 점이 더 선명하다.
`BPPlayer` 그래프의 `IA_Move`는 `BreakVector2D -> Forward * X + Right * Y -> Normalize -> AddMovementInput` 구조를 쓰는데, 현재 `APlayerCharacter::MoveKey()`는 `AddMovementInput(GetActorForwardVector(), Axis.X)`와 `AddControllerYawInput(Axis.Y)` 조합으로 정리되어 있다.
흥미로운 점은 이 함수 안에 예전 `Forward + Right` 방식이 주석으로 그대로 남아 있다는 것이다.
즉 `260406`은 블루프린트 이동 개념을 버리는 날이 아니라, 프로토타입에서 확인한 조작 방식을 C++ 설계 의도에 맞게 재배치하는 날이라고 보는 편이 맞다.

### 3.2 bUseControllerRotationYaw는 블루프린트 체크박스를 코드로 옮긴 사례다

강의는 회전부터 시작한다.
블루프린트에서 보던 `Use Controller Rotation Yaw` 옵션이 사실은 클래스의 `bool` 멤버라는 점을 설명하고, 이를 코드에서 직접 켜 준다.

```cpp
bUseControllerRotationYaw = true;
```

이 한 줄이 상징하는 것은 꽤 크다.
블루프린트 디테일 패널에서 켜고 끄던 수많은 옵션이 결국 C++ 멤버 변수의 노출 결과라는 사실을 몸으로 익히게 해 주기 때문이다.
즉 강의는 회전 구현을 통해 "블루프린트 UI를 코드 관점으로 다시 읽는 법"을 같이 가르친다.

![Use Controller Rotation Yaw 옵션](./assets/images/controller-yaw-option.jpg)

### 3.3 RotationKey는 몸통 회전과 시선 보정을 동시에 준비한다

현재 소스 기준으로 `RotationKey()`는 단순 회전보다 조금 더 앞서 있다.
스프링암 회전을 바꾸는 동시에 `UPlayerAnimInstance`에 시선 보정값을 넘겨, 다음 날짜의 애니메이션 파트가 바로 이어질 수 있게 만든다.

```cpp
void APlayerCharacter::RotationKey(const FInputActionValue& Value)
{
    FVector Axis = Value.Get<FVector>();

    mSpringArm->AddRelativeRotation(FRotator(Axis.Y, Axis.X, 0.0));

    mAnimInst->AddViewPitch(Axis.Y);
    mAnimInst->AddViewYaw(Axis.X);
}
```

강의 당시에는 회전 입력 자체를 코드로 옮기는 데 초점이 있었지만, 현재 프로젝트를 보면 이 함수가 이미 애니메이션 변수 공급 지점까지 확장되어 있다.
즉 이 날짜는 회전 구현의 종착점이 아니라, `260407`의 `Aim Offset`으로 넘어가기 위한 연결 지점이라고 볼 수 있다.

![RotationKey와 스프링암 회전](./assets/images/rotationkey-springarm.jpg)

### 3.4 JumpKey는 새 기능 추가보다 안전한 진입 조건을 만드는 데 가깝다

점프 구현은 코드 길이만 보면 가장 짧다.
하지만 강의가 강조하는 것은 "점프를 한다"보다 "가능할 때만 점프를 한다"는 조건이다.

```cpp
void APlayerCharacter::JumpKey(const FInputActionValue& Value)
{
    if (CanJump())
        Jump();
}
```

여기서 `CanJump()`를 먼저 확인하는 이유는 간단하다.
점프는 입력 이벤트가 곧바로 물리 동작으로 이어지는 기능이므로, 상태 검사를 생략하면 중복 입력이나 공중 상태 처리에서 바로 문제가 생긴다.
그리고 생성자에서 지정한 `JumpZVelocity = 700.f`는 이 기본 점프 감각을 정하는 상수 역할을 맡는다.

![JumpKey와 CanJump 체크](./assets/images/jumpkey-canjump.jpg)

### 3.5 AttackKey는 처음에는 로그와 테스트 발사체, 현재는 가상 훅으로 이어진다

공격 파트는 영상과 현재 소스를 같이 보면 흐름이 더 잘 보인다.
강의 자막은 "간단한 테스트 발사체"까지 구현한다고 설명하고, 실제 캡처에서도 `GetWorld()->SpawnActor<ATestBullet>()`를 이용한 프로토타입이 등장한다.

```cpp
FVector SpawnLoc = GetActorLocation() + GetActorForwardVector() * 150.f;

FActorSpawnParameters param;
param.SpawnCollisionHandlingOverride =
    ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

TObjectPtr<ATestBullet> Bullet =
    GetWorld()->SpawnActor<ATestBullet>(SpawnLoc, GetActorRotation(), param);
```

다만 현재 프로젝트의 `APlayerCharacter::AttackKey()`는 조금 더 추상화된 구조로 정리되어 있다.

```cpp
void APlayerCharacter::AttackKey(const FInputActionValue& Value)
{
    InputAttack();
}
```

즉 강의 단계에서는 로그 출력과 테스트 발사체로 공격 입력을 검증하고, 프로젝트가 진행되면서 그 자리가 `InputAttack()`이라는 가상 함수 훅으로 치환된 것이다.
이 덕분에 `AShinbi`는 일반 공격과 스킬 발동을 자기 방식으로 재정의할 수 있다.
실제 현재 `AShinbi` 덤프에도 `InputAttack()`, `Skill1()`, `NormalAttack()`, `Skill1Casting()`이 따로 존재하므로, 베이스 클래스가 진입점만 제공하고 파생 클래스가 내용을 채우는 구조가 문서 설명대로 이미 자리 잡았다고 볼 수 있다.

![테스트 발사체 프로토타입](./assets/images/attackkey-testbullet.jpg)

이 변화는 설계적으로도 의미가 있다.

- 베이스 클래스는 입력의 "진입점"만 가진다.
- 실제 공격 내용은 파생 클래스가 구현한다.
- 프로토타입은 빠르게 검증하되, 최종 구조는 가상 함수 기반으로 정리한다.

### 3.6 이 날짜의 끝은 전투 완성이 아니라 확장 가능한 입력 구조다

그래서 `260406`의 마지막 장을 읽을 때 중요한 것은 "공격이 얼마나 화려한가"가 아니다.
오히려 더 중요한 것은, 회전·점프·공격 입력이 모두 C++ 함수에 연결되었고, 이후 애니메이션/콤보/스킬 구현이 들어올 자리가 마련되었다는 점이다.

실제 뒤 날짜들을 보면 이 판단이 맞았음을 알 수 있다.

- `260407`: 회전 입력이 `ViewPitch`, `ViewYaw`를 통해 애니메이션으로 이어진다.
- `260408`: 공격 입력이 몽타주, 슬롯, 콤보로 발전한다.
- `260409`: 공격 입력이 충돌, 파티클, 사운드, 투사체로 확장된다.

즉 `260406`은 플레이어 전투를 끝내는 날이 아니라, 그 모든 확장을 받아낼 입력 골조를 완성하는 날이다.

### 3.7 장 정리

제3장의 결론은 다음과 같다.
회전은 블루프린트 옵션을 코드로 옮기는 연습이고, 점프는 상태 검사를 포함한 안전한 기본 동작이며, 공격은 임시 프로토타입에서 가상 함수 기반 구조로 발전하는 출발점이다.

---

## 제4장. 현재 프로젝트 C++ 코드로 다시 읽는 260406 핵심 구조

### 4.1 왜 260406부터는 "실제 소스 읽기"가 특히 중요해지는가

`260406`은 블루프린트 실습을 넘어, 본격적으로 플레이어 구조를 C++ 클래스 체계로 옮기는 첫날이다.
즉 이 시점부터는 에디터 화면만 따라가는 것보다, 실제 코드가 어떤 책임 분리를 하고 있는지 읽는 습관이 훨씬 중요해진다.

아래 코드는 `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 구현에서 핵심 부분만 추려 온 뒤, 초보자도 읽을 수 있게 설명용 주석을 보강한 축약판이다.
즉 이 장은 새 기능을 더 배우는 장이라기보다, 지금까지 문서에서 설명한 `공통 베이스 + 파생 클래스 + 입력 자산 + 게임모드 진입점` 구조를 실제 소스에서 다시 확인하는 장이라고 보면 된다.

### 4.2 `APlayerCharacter`: 플레이어 공통부가 어디까지인지 헤더만 봐도 보인다

먼저 헤더를 보면, `APlayerCharacter`가 왜 "공통 플레이어 베이스"인지 바로 드러난다.

```cpp
UCLASS()
class UE20252_API APlayerCharacter : public ACharacter,
    public IGenericTeamAgentInterface
{
    GENERATED_BODY()

protected:
    // 플레이어 시점을 위한 카메라 팔
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, meta=(AllowPrivateAccess = "true"))
    TObjectPtr<USpringArmComponent> mSpringArm;

    // 실제 화면 카메라
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, meta = (AllowPrivateAccess = "true"))
    TObjectPtr<UCameraComponent> mCamera;

    // 이후 애니메이션과 연결될 애님 인스턴스
    TObjectPtr<class UPlayerAnimInstance> mAnimInst;

private:
    // 공통 입력 함수
    void MoveKey(const FInputActionValue& Value);
    void RotationKey(const FInputActionValue& Value);
    void JumpKey(const FInputActionValue& Value);
    void AttackKey(const FInputActionValue& Value);

protected:
    // 캐릭터별로 갈라질 지점은 virtual 함수로 열어 둔다
    virtual void InputAttack();
    virtual void Skill1();
};
```

이 코드에서 읽어야 할 핵심은 두 가지다.

- 공통부: `SpringArm`, `Camera`, 입력 함수, 애님 인스턴스 참조
- 확장부: `InputAttack()`, `Skill1()`처럼 파생 클래스가 오버라이드할 함수

즉 `APlayerCharacter`는 "모든 플레이어가 공통으로 가져야 할 기본 몸체"이고, 개별 영웅 차이는 여기서 바로 다 구현하지 않는다.

### 4.3 `APlayerCharacter` 생성자: 블루프린트에서 손으로 하던 세팅이 코드로 굳어지는 순간

생성자를 보면 블루프린트에서 설정하던 값들이 거의 그대로 C++로 옮겨져 있음을 알 수 있다.

```cpp
APlayerCharacter::APlayerCharacter()
{
    PrimaryActorTick.bCanEverTick = true;

    // 카메라 팔 생성
    mSpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("Arm"));

    // 캐릭터 메시 밑에 붙인다
    mSpringArm->SetupAttachment(GetMesh());

    // 숄더뷰 시점 거리와 각도
    mSpringArm->TargetArmLength = 200.f;
    mSpringArm->SetRelativeLocation(FVector(0.0, 0.0, 150.0));
    mSpringArm->SetRelativeRotation(FRotator(-10.0, 90.0, 0.0));

    // 카메라 생성
    mCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    mCamera->SetupAttachment(mSpringArm);

    // 컨트롤러 회전을 캐릭터에 반영
    bUseControllerRotationYaw = true;

    // 점프 높이
    GetCharacterMovement()->JumpZVelocity = 700.f;

    // 플레이어 충돌 프로파일
    GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));

    // 메시 자체는 충돌 제외
    GetMesh()->SetCollisionEnabled(ECollisionEnabled::NoCollision);

    SetGenericTeamId(FGenericTeamId(TeamPlayer));
}
```

초보자용으로 이 코드를 번역하면 이렇다.

- 블루프린트에서 `SpringArm`과 `Camera`를 추가하던 일을 생성자에서 한다.
- 카메라 거리와 회전값도 여기서 고정한다.
- 점프 높이, 충돌 프로파일, 팀 ID처럼 플레이어 공통 성격도 여기서 잡는다.

즉 `260406`의 C++ 전환은 “블루프린트 기능을 포기한다”가 아니라, 블루프린트에서 확인한 구조를 더 재사용 가능한 공통 코드로 끌어올리는 과정이다.

### 4.4 `AShinbi`: 공통 베이스 위에 외형과 개별 동작을 올리는 파생 클래스

이제 파생 클래스를 보면, 왜 `APlayerCharacter`와 `AShinbi`를 분리했는지가 더 선명해진다.

```cpp
AShinbi::AShinbi()
{
    // 신비 메시 자산 로드
    static ConstructorHelpers::FObjectFinder<USkeletalMesh> MeshAsset(
        TEXT("/Script/Engine.SkeletalMesh'/Game/ParagonShinbi/Characters/Heroes/Shinbi/Skins/Tier_1/Shinbi_Dynasty/Meshes/ShinbiDynasty.ShinbiDynasty'")
    );

    if (MeshAsset.Succeeded())
        GetMesh()->SetSkeletalMeshAsset(MeshAsset.Object);

    // 외형에 맞게 캡슐과 메시 위치 보정
    GetCapsuleComponent()->SetCapsuleHalfHeight(95.f);
    GetCapsuleComponent()->SetCapsuleRadius(28.f);
    GetMesh()->SetRelativeLocation(FVector(0.0, 0.0, -95.0));
    GetMesh()->SetRelativeRotation(FRotator(0.0, -90.0, 0.0));

    // 이 캐릭터가 사용할 애니메이션 블루프린트 연결
    static ConstructorHelpers::FClassFinder<UAnimInstance> AnimClass(
        TEXT("/Script/Engine.AnimBlueprint'/Game/Player/Shinbi/ABPShinbiTemplate.ABPShinbiTemplate_C'")
    );

    if (AnimClass.Succeeded())
        GetMesh()->SetAnimInstanceClass(AnimClass.Class);
}
```

이 생성자는 플레이어 공통부를 다시 만들지 않는다.
이미 `APlayerCharacter`가 카메라와 입력 구조를 갖고 있기 때문이다.
`AShinbi`는 여기에 "신비의 외형과 애니메이션 세트"만 덧붙인다.

즉 구조를 아주 단순하게 말하면 이렇다.

- `APlayerCharacter`: 공통 몸체
- `AShinbi`: 신비 버전 외형과 개별 전투 동작

이후 영웅이 늘어나도 카메라와 입력 파이프라인은 재사용하고, 메시/애니메이션/스킬만 갈아 끼울 수 있게 되는 이유가 바로 이 분리다.

### 4.5 `ADefaultGameMode`와 `AMainPlayerController`: 누가 기본 플레이어이고, 누가 조종하는가

강의는 단순히 플레이어 클래스를 만드는 데서 멈추지 않고, 실제 게임이 시작될 때 어떤 클래스 조합이 사용될지도 코드로 고정한다.
그 역할이 `ADefaultGameMode`다.

```cpp
ADefaultGameMode::ADefaultGameMode()
{
    PrimaryActorTick.bCanEverTick = true;

    // 기본으로 어떤 캐릭터를 줄 것인가
    DefaultPawnClass = AShinbi::StaticClass();

    // 그 캐릭터를 누가 조종할 것인가
    PlayerControllerClass = AMainPlayerController::StaticClass();
}
```

이 코드를 초보자용으로 풀면:

- `DefaultPawnClass`: 기본 플레이어 몸체
- `PlayerControllerClass`: 그 몸체를 조종하는 입력 주체

즉 `GameMode`는 이 맵의 기본 규칙을 정하는 곳이다.

그리고 `AMainPlayerController`는 실제로 마우스와 입력 모드까지 관리한다.

```cpp
AMainPlayerController::AMainPlayerController()
{
    PrimaryActorTick.bCanEverTick = true;

    // 마우스 커서를 화면에 보이게 한다
    bShowMouseCursor = true;
}

void AMainPlayerController::BeginPlay()
{
    Super::BeginPlay();

    // 게임과 UI를 동시에 다루는 입력 모드
    FInputModeGameAndUI InputMode;
    SetInputMode(InputMode);
}

void AMainPlayerController::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    FHitResult Hit;
    bool Pick = GetHitResultUnderCursor(
        ECollisionChannel::ECC_GameTraceChannel5,
        true,
        Hit
    );
}
```

즉 `PlayerController`를 따로 두는 이유는 단순 possession 때문만이 아니다.
마우스 커서, 입력 모드, 화면 클릭 위치 피킹 같은 "조종 주체"의 책임을 플레이어 몸체에서 분리하기 위해서다.

### 4.6 `UDefaultInputData`: 입력 자산을 플레이어 클래스 밖으로 빼는 설계

`260406`의 아주 중요한 구조적 변화는 입력 자산을 `UDefaultInputData`에 모으는 것이다.
이 클래스는 `InputMappingContext`와 여러 `InputAction`을 한곳에 정리해 둔다.

```cpp
UCLASS()
class UE20252_API UInputData : public UObject
{
    GENERATED_BODY()

public:
    TObjectPtr<UInputMappingContext> mContext;

protected:
    TMap<FString, TObjectPtr<UInputAction>> mActions;

public:
    TObjectPtr<UInputAction> FindAction(const FString& Name) const;
};
```

실제 `UDefaultInputData` 생성자는 자산을 직접 로드한다.

```cpp
UDefaultInputData::UDefaultInputData()
{
    static ConstructorHelpers::FObjectFinder<UInputMappingContext> InputContext(
        TEXT("/Script/EnhancedInput.InputMappingContext'/Game/Input/IMC_Default.IMC_Default'")
    );
    if (InputContext.Succeeded())
        mContext = InputContext.Object;

    static ConstructorHelpers::FObjectFinder<UInputAction> MoveAction(
        TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Move.IA_Move'")
    );
    if (MoveAction.Succeeded())
        mActions.Add(TEXT("Move"), MoveAction.Object);

    static ConstructorHelpers::FObjectFinder<UInputAction> RotationAction(
        TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Rotation.IA_Rotation'")
    );
    if (RotationAction.Succeeded())
        mActions.Add(TEXT("Rotation"), RotationAction.Object);

    static ConstructorHelpers::FObjectFinder<UInputAction> JumpAction(
        TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Jump.IA_Jump'")
    );
    if (JumpAction.Succeeded())
        mActions.Add(TEXT("Jump"), JumpAction.Object);
}
```

여기서 중요한 포인트는 "플레이어 클래스가 자산 경로를 전부 직접 알 필요가 없게 된다"는 점이다.
즉 입력 자산 관리와 입력 처리 로직이 분리된다.

그리고 이 클래스는 `CDO`를 통해 꺼내 쓰도록 설계돼 있다.
소스 주석에도 "CDO가 기본으로 생성되며 입력 에셋들은 모두 로딩이 되어 있는 상태"라고 적혀 있다.

즉 초보자 관점에선 이렇게 이해하면 된다.

- `UDefaultInputData`: 입력 자산 창고
- `GetDefault<UDefaultInputData>()`: 그 창고의 기본 사본을 꺼내 쓰는 방식

### 4.7 `BeginPlay`와 `SetupPlayerInputComponent`: 등록과 바인딩은 역할이 다르다

이제 플레이어가 그 입력 자산을 어떻게 쓰는지 보자.
`APlayerCharacter`는 입력 파이프라인을 두 단계로 나눈다.

먼저 `BeginPlay()`에서 컨텍스트를 등록한다.

```cpp
void APlayerCharacter::BeginPlay()
{
    Super::BeginPlay();

    mAnimInst = Cast<UPlayerAnimInstance>(GetMesh()->GetAnimInstance());

    TObjectPtr<APlayerController> PlayerController = GetController<APlayerController>();

    if (IsValid(PlayerController))
    {
        TObjectPtr<UEnhancedInputLocalPlayerSubsystem> Subsystem =
            ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(
                PlayerController->GetLocalPlayer()
            );

        const UDefaultInputData* InputData = GetDefault<UDefaultInputData>();

        // 이 플레이어는 IMC_Default 입력 세트를 쓴다고 등록
        Subsystem->AddMappingContext(InputData->mContext, 0);
    }
}
```

그다음 `SetupPlayerInputComponent()`에서 실제 액션과 함수를 연결한다.

```cpp
void APlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    TObjectPtr<UEnhancedInputComponent> Input =
        Cast<UEnhancedInputComponent>(PlayerInputComponent);

    if (IsValid(Input))
    {
        const UDefaultInputData* InputData = GetDefault<UDefaultInputData>();

        Input->BindAction(InputData->FindAction(TEXT("Move")),
            ETriggerEvent::Triggered, this, &APlayerCharacter::MoveKey);

        Input->BindAction(InputData->FindAction(TEXT("Rotation")),
            ETriggerEvent::Triggered, this, &APlayerCharacter::RotationKey);

        Input->BindAction(InputData->FindAction(TEXT("Jump")),
            ETriggerEvent::Started, this, &APlayerCharacter::JumpKey);

        Input->BindAction(InputData->FindAction(TEXT("Attack")),
            ETriggerEvent::Started, this, &APlayerCharacter::AttackKey);
    }
}
```

이 두 함수의 차이를 아주 간단히 외우면 이렇다.

- `BeginPlay`: 입력 세트를 등록
- `SetupPlayerInputComponent`: 그 입력이 들어왔을 때 무슨 함수를 부를지 연결

즉 강의에서 말한 "등록"과 "바인딩"의 역할 분리가 실제 코드에서도 딱 그 모습으로 나타난다.

### 4.8 `RotationKey`, `JumpKey`, `AttackKey`: 기본 조작 루프와 확장 훅이 동시에 보이는 지점

현재 `APlayerCharacter`의 입력 함수는 단순하지만, 뒤 날짜로 이어질 단서가 많이 들어 있다.

```cpp
void APlayerCharacter::RotationKey(const FInputActionValue& Value)
{
    FVector Axis = Value.Get<FVector>();

    mSpringArm->AddRelativeRotation(FRotator(Axis.Y, Axis.X, 0.0));

    // 다음 애니메이션 파트에서 쓸 시선 값도 같이 갱신
    mAnimInst->AddViewPitch(Axis.Y);
    mAnimInst->AddViewYaw(Axis.X);
}

void APlayerCharacter::JumpKey(const FInputActionValue& Value)
{
    if (CanJump())
        Jump();
}

void APlayerCharacter::AttackKey(const FInputActionValue& Value)
{
    // 실제 공격 내용은 파생 클래스에 맡긴다
    InputAttack();
}
```

이 세 함수는 `260406`의 설계 철학을 잘 보여 준다.

- `RotationKey`: 회전 입력 + 다음 애니메이션 파트로 넘길 시선 값
- `JumpKey`: 안전한 점프 진입
- `AttackKey`: 실제 전투 구현이 아니라 가상 훅 진입점

즉 `AttackKey()`가 길게 무언가를 하지 않는 이유는 미완성이라서가 아니라, `AShinbi`, `AWraith` 같은 파생 클래스가 자기 방식으로 내용을 채우도록 열어 둔 구조이기 때문이다.

### 4.9 `AShinbi::InputAttack()`: 베이스 클래스가 진입점만 주고, 파생 클래스가 내용을 채운다는 뜻

실제로 `AShinbi`는 `InputAttack()`를 오버라이드해서 자기 영웅 전용 동작을 넣는다.

```cpp
void AShinbi::InputAttack()
{
    if (IsValid(mMagicCircleActor))
    {
        mAnimInst->PlaySkill1();
        mAnimInst->ClearSkill1();

        FVector Loc = mMagicCircleActor->GetActorLocation() + FVector(0.0, 0.0, 1000.0);

        FActorSpawnParameters param;
        param.SpawnCollisionHandlingOverride =
            ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

        TObjectPtr<AGeometryActor> SkillActor =
            GetWorld()->SpawnActor<AGeometryActor>(Loc, FRotator::ZeroRotator, param);

        mMagicCircleActor->Destroy();
    }
    else
    {
        mAnimInst->PlayAttack();
    }
}
```

이 함수는 `260406`의 구조가 왜 좋은지 보여 주는 대표 사례다.

- `APlayerCharacter`는 공격 입력을 받는 공통 입구만 제공
- `AShinbi`는 자기 애니메이션, 자기 스킬 액터, 자기 규칙으로 내용을 채움

즉 공통부와 개별부를 나눈 덕분에, 플레이어 시스템 전체는 하나로 유지하면서도 영웅별 차이를 자연스럽게 넣을 수 있게 된다.

### 4.10 장 정리

제4장의 결론은 `260406`이 단지 "블루프린트를 C++로 번역하는 날"이 아니라는 점이다.
실제 소스를 보면 이 날의 진짜 성과는 아래 구조를 세우는 데 있다.

- `APlayerCharacter`: 공통 플레이어 베이스
- `AShinbi`: 외형과 개별 전투 동작을 얹는 파생 클래스
- `ADefaultGameMode`: 기본 플레이어와 컨트롤러를 정하는 월드 규칙
- `AMainPlayerController`: 마우스/입력 모드를 다루는 조종 주체
- `UDefaultInputData`: 입력 자산 창고
- `BeginPlay + SetupPlayerInputComponent`: 입력 등록과 바인딩의 분리

즉 `260406`은 플레이어 조작이 "동작하는 상태"를 넘어서, 이후 애니메이션과 전투, 캐릭터 확장을 모두 받아낼 수 있는 구조를 만든 날이라고 볼 수 있다.

---

## 전체 정리

`260406`은 플레이어 시스템에서 가장 중요한 전환점 중 하나다.
이전까지 블루프린트에 기대고 있던 플레이어를 C++ 공통 베이스로 옮기고, 입력 자산을 별도 객체로 정리하고, 회전·점프·공격의 기본 조작까지 코드로 연결한다.
그리고 이번 정리본에서는 여기에 더해, 그 구조가 현재 `UE20252` 소스에서 `PlayerCharacter`, `Shinbi`, `DefaultGameMode`, `MainPlayerController`, `InputData`로 어떻게 정리되어 있는지도 함께 읽는다.

이 날짜를 이해하면 뒤 강의들이 왜 자연스럽게 이어지는지도 보인다.

- 애니메이션은 `APlayerCharacter`가 준비한 회전/점프 정보를 받는다.
- 전투는 `AttackKey -> InputAttack()` 구조 위에서 확장된다.
- 캐릭터 증식은 `APlayerCharacter` 공통부와 `AShinbi` 파생부 분리 덕분에 쉬워진다.

즉 `260406`의 진짜 성과는 "플레이어가 움직인다"가 아니라, "플레이어 시스템을 키울 수 있는 코드 구조가 생겼다"는 데 있다.

## 복습 체크리스트

- `Character` 기반 클래스를 쓰는 이유를 설명할 수 있는가?
- `APlayerCharacter`와 `AShinbi`의 책임 분리를 말할 수 있는가?
- `DefaultPawnClass`와 `PlayerControllerClass`가 실제로 무엇을 결정하는지 이해했는가?
- `UDefaultInputData`가 왜 입력 자산의 창고 역할을 하는지 설명할 수 있는가?
- `BeginPlay()`와 `SetupPlayerInputComponent()`의 차이를 구분할 수 있는가?
- `RotationKey`, `JumpKey`, `AttackKey`가 이후 애니메이션/전투 확장과 어떻게 이어지는지 설명할 수 있는가?
- `APlayerCharacter`, `AShinbi`, `ADefaultGameMode`, `AMainPlayerController`, `UDefaultInputData` 코드를 보고 공통부/개별부/입력 자산 구조를 실제 구현과 연결할 수 있는가?

## 세미나 질문

1. 입력 자산을 `PlayerCharacter` 내부에서 직접 로딩하지 않고 `UDefaultInputData`로 분리한 선택은 어떤 유지보수 이점을 주는가?
2. 테스트 발사체 같은 임시 프로토타입을 빠르게 만드는 방식과, 최종 구조를 가상 함수 기반으로 정리하는 방식은 어떻게 공존할 수 있는가?
3. `APlayerCharacter`에 너무 많은 기능을 몰아넣지 않으려면, 이후 날짜에서 어떤 기준으로 공통부와 개별부를 계속 분리해야 할까?
4. `GameMode`, `PlayerController`, `PlayerCharacter`를 분리하는 구조는 "플레이어 하나가 다 한다"는 방식보다 어떤 장점을 주는가?

## 권장 과제

1. `AWraith`를 기본 플레이어로 바꾸는 상황을 가정하고, `ADefaultGameMode`와 파생 클래스가 어떤 식으로 바뀌어야 하는지 스스로 정리해 본다.
2. `UDefaultInputData`에 `Dash` 같은 새 액션을 추가한다고 가정하고, 등록 위치와 바인딩 위치를 각각 적어 본다.
3. `AttackKey()`가 지금은 `InputAttack()`만 호출하도록 남아 있는 이유를, 상속 구조와 확장성 관점에서 5문장 안으로 설명해 본다.
4. `APlayerCharacter`, `UDefaultInputData`, `ADefaultGameMode`, `AMainPlayerController`를 보고 "공통 베이스 -> 입력 자산 -> 월드 진입점 -> 조종 주체" 흐름을 화살표로 정리해 본다.
