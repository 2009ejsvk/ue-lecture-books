---
title: 260402 플레이어 블루프린트와 발사체 기초
---

# 260402 플레이어 블루프린트와 발사체 기초

## 문서 개요

이 문서는 `260402_1_이동 컴포넌트`, `260402_2_플레이어 제작`, `260402_3_액터 스폰과 회전`, `260402_3_액터 스폰과 회전_2`를 하나의 연속된 교재로 다시 정리한 것이다.
이번 날짜의 핵심은 언리얼의 기본 컴포넌트를 손에 익히고, 블루프린트 플레이어를 직접 만들고, 마지막으로 입력을 받아 발사체를 스폰하는 가장 기초적인 액션 게임 루프를 완성하는 데 있다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`Movement Component 이해 -> BPPlayer와 숄더뷰 카메라 제작 -> IA_Attack / BPBullet / Spawn Actor`

즉 `260402`는 이후의 전투, 충돌, 애니메이션, AI 강의보다 훨씬 앞단에 있는 “조작 가능한 캐릭터와 간단한 액터 생성”의 출발점이다.
아직 화려한 전투 시스템은 없지만, 이 날짜에서 배우는 컴포넌트 감각이 있어야 뒤에서 나오는 충돌 판정, 투사체, 스킬, 몬스터 스폰 구조도 자연스럽게 읽힌다.

이 교재는 다음 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상과 자막
- 원본 MP4에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스

## 학습 목표

- `Static Mesh`와 `Skeletal Mesh`의 차이를 실제 플레이어 제작 관점에서 설명할 수 있다.
- `Floating Pawn Movement`, `Projectile Movement`, `Rotating Movement`, `InterpTo Movement`의 쓰임을 구분할 수 있다.
- `Spring Arm`과 `Camera`를 이용해 숄더뷰 플레이어 시점을 만드는 이유를 설명할 수 있다.
- `Enhanced Input`의 `Mapping Context`와 `IA_Move`, `IA_Attack`가 블루프린트 조작 루프에서 어떤 역할을 하는지 말할 수 있다.
- 메시를 직접 쏘는 대신 별도 액터인 `BPBullet`을 만들어 `Spawn Actor`와 `Projectile Movement`로 발사하는 구조를 정리할 수 있다.
- `Location`, `Rotation`, `Forward Vector`를 조합해 발사체 생성 방향을 제어하는 기본 원리를 설명할 수 있다.

## 강의 흐름 요약

1. 에셋을 가져오고, `Skeletal Mesh`와 여러 `Movement Component`를 비교하면서 “움직이는 액터”를 만드는 언리얼 기본 문법을 익힌다.
2. `BPPlayer`를 만들고 `Spring Arm`과 `Camera`를 붙여 액션 게임용 숄더뷰 시점을 만든다.
3. `IMC_Default`, `IA_Move`, `IA_Attack`를 연결해 입력 자산과 블루프린트 이벤트 그래프를 묶는다.
4. 총알은 메시 컴포넌트를 직접 날리는 대신 별도 액터 `BPBullet`로 만들고, 여기에 `Projectile Movement`를 붙여 발사체처럼 움직이게 한다.
5. 마지막으로 `Spawn Actor from Class`와 `Transform` 계산을 이용해, 플레이어가 보는 방향 앞쪽으로 발사체를 생성한다.

---

## 제1장. 이동 컴포넌트와 메시의 기초: 움직일 수 있는 액터를 어떻게 이해할 것인가

### 1.1 플레이어 제작은 메시 선택에서 시작하지만 핵심은 구조 이해다

첫 강의는 에셋을 받는 이야기로 시작한다.
자막에서도 `Fab`, `Paragon`, 마네킹 같은 키워드가 먼저 나오는데, 이 파트의 목적은 “예쁜 캐릭터를 구하는 법”보다 “언리얼에서 캐릭터를 어떤 자산 조합으로 다루는가”를 익히는 데 있다.

언리얼에서 플레이어가 화면에 보이려면 단순히 모델 파일 하나가 있는 것으로 끝나지 않는다.
캐릭터 메시, 스켈레톤, 애니메이션, 움직임을 담당하는 컴포넌트, 그리고 그것을 담는 액터 구조가 함께 있어야 한다.
즉 이번 날짜는 아트 자산을 가져오는 시간이 아니라, “보이는 오브젝트”를 “움직이는 게임 액터”로 바꾸는 첫 수업에 가깝다.

![Paragon Shinbi 에셋을 확인하는 장면](./assets/images/fab-skeletal-asset.jpg)

### 1.2 Static Mesh와 Skeletal Mesh의 차이는 곧 행동 가능성의 차이다

강의 초반에서 가장 중요하게 짚는 개념은 `Static Mesh`와 `Skeletal Mesh`의 차이다.
`Static Mesh`는 형태만 가진 오브젝트이고, `Skeletal Mesh`는 뼈 구조를 가지므로 애니메이션을 재생할 수 있다.
이 차이를 단순 정의로 외우는 것보다, 플레이어 제작 관점에서 읽는 편이 훨씬 좋다.

- `Static Mesh`: 벽, 상자, 총알, 단순 소품처럼 뼈대가 필요 없는 물체
- `Skeletal Mesh`: 플레이어, 몬스터, 인간형 NPC처럼 자세와 동작 변화가 중요한 캐릭터

즉 플레이어를 만들겠다면 처음부터 `Skeletal Mesh`를 골라야 한다.
나중에 `Anim Blueprint`, `Montage`, `Aim Offset`으로 넘어갈 수 있는 전제가 바로 이 선택이기 때문이다.

### 1.3 Movement Component는 “이 액터를 어떤 방식으로 움직일 것인가”를 미리 정리한 도구다

강의는 이어서 언리얼이 기본 제공하는 이동 컴포넌트를 비교한다.
이 부분이 중요한 이유는, 이후 강의에서 등장하는 발사체와 몬스터, 플레이어가 모두 각자 다른 이동 컴포넌트 철학 위에서 움직이기 때문이다.

자막에 나오는 대표 예시는 다음과 같다.

- `Floating Pawn Movement`
- `Projectile Movement`
- `Rotating Movement`
- `InterpTo Movement`

이 네 가지를 초보자 관점에서 다시 정리하면 아래와 같다.

- `Floating Pawn Movement`: 방향 입력을 받아 부드럽게 이동하는 단순 Pawn용 이동
- `Projectile Movement`: 속도와 방향에 따라 발사체처럼 움직이는 이동
- `Rotating Movement`: 계속 회전하는 오브젝트에 적합한 이동
- `InterpTo Movement`: 지정 지점 사이를 보간하며 움직이는 이동

즉 이동은 직접 위치를 매 프레임 계산해서 넣는 것만이 답이 아니다.
언리얼은 “자주 쓰는 이동 규칙”을 컴포넌트로 미리 제공하므로, 제작자는 거기에 액터의 역할을 맞춰 주면 된다.

### 1.4 현재 C++ 프로젝트도 같은 발상 위에 서 있다

강의는 블루프린트 단계에서 진행되지만, 현재 `UE20252` 소스를 보면 같은 개념이 그대로 이어져 있음을 알 수 있다.
몬스터 베이스 클래스는 이동을 직접 짜지 않고 `UFloatingPawnMovement`를 사용한다.

```cpp
mMovement = CreateDefaultSubobject<UFloatingPawnMovement>(TEXT("Movement"));
mMovement->SetUpdatedComponent(mBody);
```

이 코드는 나중 날짜의 몬스터 AI 강의에 나오지만, 개념 자체는 이미 `260402`에서 설명한 이동 컴포넌트 철학과 같다.
즉 컴포넌트는 “나중에 붙이는 편의 기능”이 아니라, 액터의 움직임 성격을 정하는 핵심 설계 요소다.

### 1.5 카메라와 스프링암도 결국 플레이어용 컴포넌트 조합이다

첫 강의 후반부는 카메라와 `Spring Arm`을 미리 보여 준다.
이 역시 중요한 이유가 있다.
플레이어를 조작한다는 것은 단지 메시를 움직이는 것이 아니라, “어떤 시점에서 그 움직임을 보게 할 것인가”를 함께 정하는 일이기 때문이다.

`Spring Arm`은 부모와 자식 카메라 사이의 거리를 자연스럽게 유지하게 해 주는 컴포넌트다.
따라서 카메라를 캐릭터에 바로 박아 두는 것보다, 액션 게임 시점을 만들 때 훨씬 편하다.
이 날짜의 두 번째 강의가 곧바로 숄더뷰 플레이어 제작으로 이어지는 이유도 이 전제가 이미 깔려 있기 때문이다.

![기본 플레이어 테스트 씬과 이동 실험](./assets/images/bpplayer-test-scene.jpg)

### 1.6 장 정리

제1장의 핵심은 액터를 움직이게 만들 때 메시, 이동 컴포넌트, 카메라 컴포넌트를 각각 따로 보지 말고 하나의 구조로 이해해야 한다는 점이다.
`260402`는 플레이어를 완성하는 날이라기보다, 언리얼에서 움직이는 오브젝트를 조립하는 기본 문법을 익히는 날이다.

---

## 제2장. BPPlayer와 숄더뷰 카메라: 조작 가능한 플레이어를 어떻게 세울 것인가

### 2.1 두 번째 강의의 진짜 목표는 “시점이 있는 조작감”이다

두 번째 강의는 `BPPlayer`를 만드는 이야기지만, 실제 핵심은 “액션 게임처럼 느껴지는 시점”을 세팅하는 데 있다.
자막에서도 정통 3인칭 템플릿보다 약간 옆에서 보는 숄더뷰 느낌을 만들겠다는 설명이 반복된다.

이 차이는 매우 실전적이다.
단순히 캐릭터 뒤에 카메라를 두는 것과, 약간 위에서 어깨 너머로 보는 카메라를 만드는 것은 조작감과 공격 연출의 인상이 크게 다르다.
즉 이 날짜는 이동 입력보다 먼저 “플레이어가 세계를 바라보는 방식”을 만드는 강의라고 볼 수 있다.

### 2.2 Spring Arm을 먼저 넣고 Camera를 자식으로 붙이는 구조가 정석이다

강의는 `Spring Arm`을 먼저 추가하고, 그 아래에 `Camera`를 붙이는 순서로 진행된다.
이 순서가 중요한 이유는 카메라 거리와 각도, 충돌 보정을 모두 `Spring Arm`이 맡기 때문이다.

강의에서 강조하는 조정 포인트는 대체로 다음과 같다.

- `Target Arm Length`: 캐릭터와 카메라 거리
- `Relative Rotation`: 약간 내려다보는 각도
- 카메라 오프셋: 완전 정중앙이 아닌 숄더뷰 느낌

현재 프로젝트의 `APlayerCharacter` 생성자를 보면, 블루프린트에서 손으로 맞추던 값이 훗날 C++ 코드로 그대로 옮겨졌음을 알 수 있다.

```cpp
mSpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("Arm"));
mSpringArm->SetupAttachment(GetMesh());
mSpringArm->TargetArmLength = 200.f;
mSpringArm->SetRelativeLocation(FVector(0.0, 0.0, 150.0));
mSpringArm->SetRelativeRotation(FRotator(-10.0, 90.0, 0.0));

mCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
mCamera->SetupAttachment(mSpringArm);
```

즉 `260402`에서 배우는 숄더뷰는 일회성 블루프린트 트릭이 아니다.
뒤의 `260406` C++ 전환 파트에서도 그대로 살아남는 플레이어 시점의 기본 설계다.

![BPPlayer 컴포넌트와 Spring Arm 설정](./assets/images/bpplayer-components.jpg)

### 2.3 Enhanced Input은 입력을 “키 하나”가 아니라 “액션 자산”으로 다루게 만든다

강의 중반부는 `Enhanced Input` 설정으로 넘어간다.
초보자 입장에서는 이 부분이 복잡해 보일 수 있지만, 핵심은 단순하다.
입력을 곧바로 키보드 버튼과 연결하지 않고, 먼저 `IA_Move`, `IA_Attack` 같은 `Input Action` 자산을 만들고 이를 `Mapping Context`에 넣는 것이다.

이 방식의 장점은 크다.

- 입력 의미를 자산 이름으로 관리할 수 있다.
- 키 변경과 로직 변경을 분리할 수 있다.
- 나중에 C++에서 같은 액션 이름을 읽어 바인딩하기 쉬워진다.

즉 `Enhanced Input`은 “입력 이벤트를 더 복잡하게 만드는 시스템”이 아니라, 입력을 장기적으로 관리하기 좋게 만드는 체계다.

![Enhanced Input Mapping Context 등록 화면](./assets/images/enhanced-input-mapping-context.jpg)

### 2.4 IA_Move는 플레이어 이동의 가장 작은 단위다

자막 후반에서는 `IA_Move`를 실제 키에 연결하고 이벤트 그래프에서 받는 흐름을 보여 준다.
이 파트의 의의는 단순히 “WASD를 연결했다”가 아니다.
중요한 것은 플레이어 이동이 이제 프로젝트 전역에서 재사용 가능한 입력 액션으로 이름 붙었다는 점이다.

현재 C++ 구조에서도 그 흔적이 명확하다.
`UDefaultInputData`는 `IA_Move`를 로딩해 `"Move"`라는 키로 보관하고, `APlayerCharacter`는 그 액션을 찾아 `MoveKey()`에 바인딩한다.

```cpp
static ConstructorHelpers::FObjectFinder<UInputAction> MoveAction(
    TEXT("/Script/EnhancedInput.InputAction'/Game/Input/IA_Move.IA_Move'"));

if (MoveAction.Succeeded())
    mActions.Add(TEXT("Move"), MoveAction.Object);
```

그리고 실제 바인딩은 이렇게 이뤄진다.

```cpp
Input->BindAction(InputData->FindAction(TEXT("Move")), ETriggerEvent::Triggered,
    this, &APlayerCharacter::MoveKey);
```

즉 블루프린트 시절에 만든 `IA_Move`는 나중에 사라지는 임시 자산이 아니라, C++ 플레이어 시스템으로 이어지는 공용 입력 인터페이스가 된다.

![IA_Move 입력 매핑 화면](./assets/images/ia-move-mapping.jpg)

### 2.5 Move 입력은 “전진”과 “회전”을 어떻게 나눌 것인가의 문제로 이어진다

초기 플레이어 제작에서는 보통 이동과 회전을 같은 축에서 다루는 경우가 많다.
강의에서도 전진과 방향 전환을 어떻게 섞을지 실험하는 흐름이 보인다.
현재 소스를 보면 이 구조가 조금 더 정리된 형태로 남아 있다.

```cpp
void APlayerCharacter::MoveKey(const FInputActionValue& Value)
{
    FVector Axis = Value.Get<FVector>();

    AddMovementInput(GetActorForwardVector(), Axis.X);
    AddControllerYawInput(Axis.Y);
}
```

이 구현은 매우 초반형 액션 게임 조작 구조다.

- `Axis.X`: 현재 바라보는 방향으로 전진
- `Axis.Y`: 몸체 회전

즉 완전한 자유 이동보다, “앞을 보며 전진하고 좌우로 방향을 돌리는” 구조에 가깝다.
강의에서 숄더뷰 카메라를 강조한 이유도 여기에 있다.
이 시점은 이런 조작 방식과 잘 어울린다.

### 2.6 BPPlayer는 나중에 PlayerCharacter로 옮겨 가는 중간 단계다

두 번째 강의를 복습할 때 중요한 태도는, `BPPlayer`를 완성품으로 보지 않는 것이다.
이 블루프린트는 플레이어 구조를 빠르게 실험하는 매우 좋은 중간 단계다.
컴포넌트 배치, 카메라 거리, 입력 자산 연결을 먼저 손으로 체득한 다음, 뒤의 `260406`에서 그 내용을 `APlayerCharacter`와 `UDefaultInputData`로 옮기는 흐름이 훨씬 자연스럽다.

즉 `BPPlayer`는 버려지는 프로토타입이 아니라, C++ 구조를 이해하기 위한 선행 실습이다.

### 2.7 장 정리

제2장의 결론은 플레이어 제작에서 메시보다 중요한 것이 시점과 입력 구조라는 점이다.
`Spring Arm + Camera`는 숄더뷰를 만들고, `Enhanced Input`은 조작을 액션 자산으로 정리한다.
이 둘이 합쳐져야 비로소 “조작 가능한 플레이어”가 만들어진다.

---

## 제3장. IA_Attack, BPBullet, Spawn Actor: 메시가 아니라 액터를 발사한다는 뜻

### 3.1 공격 입력은 곧바로 총알이 아니라 액터 생성 문제로 이어진다

세 번째 강의는 `IA_Attack`를 추가하는 데서 시작한다.
겉으로 보면 단순히 마우스 왼쪽 버튼을 연결하는 작업처럼 보이지만, 실질적으로는 “플레이어 입력을 받아 새로운 액터를 월드에 만드는 방법”을 배우는 장이다.

즉 여기서의 공격은 데미지 시스템보다 먼저, 스폰 시스템의 입문이다.
플레이어가 무언가를 발사한다는 말은 결국 특정 위치와 방향을 가진 액터를 생성한다는 뜻이기 때문이다.

![공격 입력과 플레이어 시점에서 보는 발사 준비](./assets/images/attack-input-player-view.jpg)

### 3.2 메시를 직접 쏘지 않고 BPBullet 액터를 만드는 이유

자막에서 아주 중요하게 짚는 문장이 있다.
“메시는 액터가 아닙니다.”
이 말은 초보자가 자주 헷갈리는 지점을 정확히 찌른다.

정리하면 다음과 같다.

- `Static Mesh`는 액터 안에 들어가는 컴포넌트 자원이다.
- 월드에 독립적으로 존재하고 움직이고 수명을 가지려면 `Actor`가 필요하다.
- 따라서 총알처럼 날아가는 물체는 메시 하나가 아니라, 메시를 품은 `BPBullet` 액터로 만들어야 한다.

이 사고방식은 이후 모든 시스템으로 확장된다.
폭발, 이펙트, 몬스터 스폰, 파괴 오브젝트도 결국 “보이는 자산”과 “월드 액터”를 구분해서 다뤄야 하기 때문이다.

### 3.3 Projectile Movement를 붙이면 발사체다운 움직임을 가장 빨리 만들 수 있다

강의는 `BPBullet`에 `Projectile Movement`를 붙여 가장 빠르게 발사체를 완성한다.
직접 Tick에서 위치를 갱신하지 않고, 언리얼이 제공하는 발사체 전용 이동 규칙을 그대로 활용하는 방식이다.

현재 프로젝트의 가장 얇은 예제는 `ATestBullet`이다.

```cpp
mMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
SetRootComponent(mMesh);

mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
mMovement->SetUpdatedComponent(mMesh);
mMovement->ProjectileGravityScale = 0.f;
mMovement->InitialSpeed = 1000.f;
```

이 코드는 강의에서 블루프린트로 붙이던 `Projectile Movement`의 C++ 대응 예시다.
중력 비율을 `0`으로 두면 직선 발사체에 가깝고, 초기 속도를 올리면 더 빠르게 날아간다.
즉 `260402`의 총알은 단순한 장난감 오브젝트가 아니라, 뒤의 `260403`, `260409` 전투 시스템으로 이어질 투사체의 원형이다.

![BPBullet 클래스와 Projectile Movement 세팅](./assets/images/bpbullet-class-setup.jpg)

### 3.4 Spawn Actor from Class는 “무엇을, 어디에, 어느 방향으로”의 문제다

강의 후반 핵심은 `Spawn Actor from Class` 노드다.
이 노드는 세 질문에 답해야 제대로 쓸 수 있다.

- 무엇을 생성할 것인가
- 어디에 생성할 것인가
- 어느 방향으로 생성할 것인가

여기서 가장 헷갈리는 부분이 `Transform`이다.
자막에서도 `Transform = Location + Rotation + Scale`이라고 설명한 뒤, 위치와 회전을 분리해서 생각하는 편이 더 낫다고 정리한다.

이 조언은 아주 실용적이다.
처음부터 한 번에 복잡한 `Transform`을 만들기보다,

- 발사 위치는 플레이어 앞쪽으로 얼마나 띄울지
- 발사 회전은 플레이어가 현재 어느 방향을 보는지

이 두 가지를 따로 계산한 뒤 합치는 편이 훨씬 읽기 쉽기 때문이다.

![Spawn Actor의 Transform과 Rotation 설명 장면](./assets/images/spawn-transform-rotation.jpg)

### 3.5 현재 PlayerCharacter 소스에는 초기 발사 실험 흔적이 그대로 남아 있다

흥미로운 점은, 지금 프로젝트의 `APlayerCharacter::AttackKey()` 안에 이 강의의 실습 흔적이 주석으로 남아 있다는 것이다.

```cpp
FVector SpawnLoc = GetActorLocation() + GetActorForwardVector() * 150.f;

FActorSpawnParameters param;
param.SpawnCollisionHandlingOverride =
    ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

TObjectPtr<ATestBullet> Bullet =
    GetWorld()->SpawnActor<ATestBullet>(SpawnLoc, GetActorRotation(), param);

Bullet->SetLifeSpan(5.f);
```

이 코드는 강의가 전달하려는 핵심을 아주 잘 요약한다.

- `GetActorLocation()`: 현재 플레이어 위치
- `GetActorForwardVector() * 150.f`: 플레이어 앞쪽 오프셋
- `GetActorRotation()`: 플레이어가 보는 방향
- `SpawnActor`: 발사체 생성

즉 공격 입력은 결국 “현재 액터의 위치와 방향을 읽어 다른 액터를 앞쪽에 생성하는 것”으로 환원된다.
이 원리를 이해하면 나중에 총알뿐 아니라 마법 투사체, 설치형 오브젝트, 몬스터 스폰도 비슷한 사고로 읽을 수 있다.

### 3.6 Forward Vector와 Arrow Component는 방향 감각을 시각화하는 도구다

강의가 마지막에 회전과 방향을 길게 설명하는 이유도 여기에 있다.
발사체가 엉뚱한 방향으로 생성되는 문제는 대개 “액터의 앞 방향을 정확히 이해하지 못해서” 발생한다.
그래서 언리얼에서는 `Arrow Component`나 `Forward Vector` 개념을 자주 함께 본다.

나중 날짜의 몬스터 클래스도 에디터 전용 `ArrowComponent`를 두고 있다.

```cpp
mArrowComponent = CreateEditorOnlyDefaultSubobject<UArrowComponent>(TEXT("Arrow"));
mArrowComponent->SetupAttachment(mBody);
```

이는 결국 방향을 눈으로 확인하기 위한 장치다.
즉 `260402`에서 배우는 회전 계산은 단지 총알 발사를 위한 테크닉이 아니라, 월드에 놓인 액터가 “어디를 앞이라고 생각하는지” 이해하는 기초다.

![Forward 방향과 Arrow 기준을 확인하는 장면](./assets/images/pawn-forward-arrow.jpg)

### 3.7 ProjectileBase는 이후 충돌 처리까지 확장되는 발사체 베이스의 예고편이다

현재 소스의 `AProjectileBase`를 보면 `Projectile Movement`에 `OnProjectileStop` 이벤트를 연결해 두고 있다.

```cpp
mBody = CreateDefaultSubobject<UBoxComponent>(TEXT("Body"));
mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));

SetRootComponent(mBody);
mMovement->SetUpdatedComponent(mBody);
mMovement->OnProjectileStop.AddDynamic(this, &AProjectileBase::ProjectileStop);
```

이 구조는 `260402`의 연장선에서 보면 아주 자연스럽다.
이번 날짜가 “발사체를 스폰해서 날리는 법”을 배웠다면, 다음 날짜들은 여기에 충돌, 파티클, 사운드, 데미지를 덧붙이는 식으로 발전하기 때문이다.
즉 `260402`의 총알은 이후 전투 파이프라인의 씨앗이다.

![컴포넌트 기반 발사체와 Projectile Movement 미리보기](./assets/images/projectile-from-component.jpg)

### 3.8 장 정리

제3장의 결론은 분명하다.
플레이어가 무언가를 쏜다는 것은 메시를 직접 움직이는 일이 아니라, 별도 액터를 생성하고 그 액터에 발사체용 이동 규칙을 붙이는 일이다.
`IA_Attack`, `BPBullet`, `Projectile Movement`, `Spawn Actor`, `Forward Vector`를 함께 이해해야 이 흐름이 온전히 잡힌다.

---

## 전체 정리

`260402`는 초반 강의답게 내용이 단순해 보이지만, 실제로는 언리얼 게임플레이 제작의 기초 문법이 거의 다 들어 있다.
첫 번째 장에서 메시와 이동 컴포넌트라는 기본 재료를 익히고, 두 번째 장에서 시점과 입력을 갖춘 `BPPlayer`를 만들고, 세 번째 장에서 액터 생성과 방향 계산을 이용해 발사체까지 연결한다.

이 날짜를 이해하면 뒤의 강의들이 왜 자연스럽게 이어지는지도 보인다.

- `260403`: 발사체가 충돌했을 때 무엇이 일어나는지를 배운다.
- `260406`: 블루프린트 플레이어 구조를 `APlayerCharacter`와 `UDefaultInputData`로 코드화한다.
- `260409`: 단순 발사체에 파티클, 사운드, 데미지, 충돌 프로파일을 붙여 전투 파이프라인으로 확장한다.

즉 `260402`의 진짜 성과는 “캐릭터가 움직인다”가 아니라, “조작, 시점, 발사체 생성이라는 액션 게임의 가장 작은 고리를 직접 조립할 수 있게 된다”는 데 있다.

## 복습 체크리스트

- `Static Mesh`와 `Skeletal Mesh`의 차이를 플레이어 제작 관점에서 설명할 수 있는가?
- `Floating Pawn Movement`와 `Projectile Movement`가 각각 어떤 액터에 적합한지 구분할 수 있는가?
- `Spring Arm + Camera` 조합이 왜 숄더뷰 플레이어에 유리한지 설명할 수 있는가?
- `IA_Move`, `IA_Attack`, `Mapping Context`의 관계를 말할 수 있는가?
- 메시가 아닌 `BPBullet` 액터를 만들어야 하는 이유를 설명할 수 있는가?
- `GetActorLocation() + GetActorForwardVector() * 거리`가 어떤 의미인지 이해했는가?
- `Transform`을 위치와 회전으로 나눠 생각하는 이유를 설명할 수 있는가?

## 세미나 질문

1. `BPPlayer` 단계에서 먼저 카메라와 입력을 실험해 본 뒤 `APlayerCharacter`로 옮기는 방식은 어떤 학습 장점을 주는가?
2. 총알을 메시 컴포넌트가 아니라 별도 액터로 분리하는 선택은 이후 충돌과 수명, 이펙트 처리에 어떤 이점을 주는가?
3. 플레이어 전진과 회전을 한 축 입력에서 함께 다루는 구조는 어떤 장단점을 가지며, 나중에 어떤 형태로 발전할 수 있을까?

## 권장 과제

1. `BPBullet` 대신 다른 메시를 가진 발사체를 하나 더 만든다고 가정하고, 무엇을 새 액터로 분리해야 하는지 적어 본다.
2. `IA_Attack`에 오른쪽 마우스를 추가 매핑한다고 가정하고, 입력 자산과 이벤트 그래프에서 바뀌는 지점을 정리해 본다.
3. 현재 `APlayerCharacter::AttackKey()`의 주석 코드를 기준으로, 발사 위치를 더 위쪽이나 더 오른쪽 어깨 쪽으로 옮기려면 어떤 값들을 조정해야 하는지 스스로 설명해 본다.
