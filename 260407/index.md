---
title: 260407 플레이어 로코모션 애니메이션 기초
---

# 260407 플레이어 로코모션 애니메이션 기초

## 문서 개요

이 문서는 `260407_1`부터 `260407_4`까지의 강의를 하나의 연속된 교재로 다시 정리한 것이다.
이번 날짜의 핵심은 플레이어 C++ 구조 위에 "움직이는 몸"을 처음 올리는 데 있다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`AnimInstance 중간 레이어 -> Aim Offset -> GroundLocomotion / Blend Space -> Jump 상태 머신`

즉 `260407`은 플레이어 전투보다 앞단에 있는 기본 애니메이션 교안이다.
앞에서 만든 입력과 캐릭터 이동을 애님 블루프린트와 연결하고, 시선 보정과 방향 전환, 점프까지 포함한 기초 로코모션을 세운다.

이 교재는 아래 세 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상과 자막
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스

## 학습 목표

- `UPlayerAnimInstance`를 중간 레이어로 두는 이유를 설명할 수 있다.
- `MoveSpeed`, `ViewPitch`, `ViewYaw`, `mIsInAir`, `mYawDelta`가 애님 그래프에서 어떤 의미를 갖는지 말할 수 있다.
- `Aim Offset`, `Blend Space`, `GroundLocomotion` 상태 머신이 각각 무엇을 담당하는지 구분할 수 있다.
- `Save Cached Pose`, `JumpStart / JumpApex / JumpLand`, `Apply Additive`가 점프 로코모션을 어떻게 구성하는지 설명할 수 있다.

## 강의 흐름 요약

1. 플레이어용 C++ `AnimInstance`를 만들고 애님 블루프린트가 그 클래스를 상속받게 한다.
2. 카메라 회전값을 `ViewPitch`, `ViewYaw`로 넘겨 `Aim Offset`에 연결한다.
3. `GroundLocomotion` 안에 `Idle`, `JogStart`, `Run`, `JogStop` 구조를 만들고, 방향과 회전을 더 자연스럽게 섞는다.
4. 점프는 별도 상태 머신으로 분리하고, 착지는 `GroundLoco` 캐시 포즈와 애디티브 모션으로 보정한다.

---

## 제1장. Animation Blueprint와 AnimInstance: 플레이어와 애님 그래프를 연결하는 중간 레이어

### 1.1 왜 애니메이션도 C++와 블루프린트를 함께 써야 하는가

첫 강의는 아주 중요한 관점 전환에서 시작한다.
애니메이션은 단순히 모션 파일을 재생하는 문제가 아니라, 어떤 상태에서 어떤 상태로 넘어갈지와 그 전환을 무엇으로 제어할지가 핵심이다.
그래서 언리얼은 애니메이션을 순수 C++만으로 밀어붙이기보다, 애님 블루프린트와 C++를 함께 쓰는 구조를 권장한다.

자막에서도 반복해서 강조하듯, 플레이어 애니메이션이 잘 잡히면 이후 몬스터 애니메이션은 이 구조를 단순화해 적용하는 수준으로 내려온다.
즉 `260407`은 단순한 플레이어 강의가 아니라, 프로젝트 전체 애님 구조의 출발점이다.

### 1.2 AnimBlueprint는 결국 AnimInstance를 상속한다

강의의 첫 번째 핵심은 `AnimBlueprint`도 결국 `AnimInstance`를 상속하는 객체라는 점이다.
이 말은 곧, 우리도 캐릭터 클래스 때와 똑같이 중간 C++ 클래스를 하나 두고 그 위를 블루프린트가 상속하게 만들 수 있다는 뜻이다.

실제 프로젝트의 중간 레이어는 `UPlayerAnimInstance`다.
이 클래스가 플레이어 쪽에서 계산한 값을 모으고, 애님 블루프린트는 그 값을 시각적인 상태 머신과 블렌딩에 사용한다.

![기본 애님 블루프린트 그래프](./assets/images/animbp-basic-graph.jpg)

### 1.3 UPlayerAnimInstance는 애님 그래프가 읽을 변수를 준비한다

`UPlayerAnimInstance`에는 로코모션과 시선 처리, 점프 상태에 필요한 핵심 값들이 들어 있다.

```cpp
UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
float mMoveSpeed;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
float mViewPitch;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
float mViewYaw;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
bool mIsInAir;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
float mYawDelta;
```

이 구조가 중요한 이유는 애님 블루프린트가 직접 게임플레이 객체를 이리저리 뒤지지 않아도 되게 만들기 때문이다.
애님 그래프는 필요한 정보를 이미 정리된 변수 형태로 받아 쓰고, 게임플레이 쪽은 그 값이 어떤 의미인지 C++에서 관리한다.

### 1.4 캐릭터는 실제로 어떤 애님 블루프린트를 쓰는가

애님 블루프린트가 만들어졌다면, 마지막으로 캐릭터 메시가 그 클래스를 실제로 사용하게 해야 한다.
`Shinbi.cpp`와 `Wraith.cpp`는 둘 다 생성자에서 애님 블루프린트 클래스를 찾아 메시 컴포넌트에 연결한다.

```cpp
static ConstructorHelpers::FClassFinder<UAnimInstance> AnimClass(
    TEXT("/Script/Engine.AnimBlueprint'/Game/Player/Shinbi/ABPShinbiTemplate.ABPShinbiTemplate_C'"));

if (AnimClass.Succeeded())
    GetMesh()->SetAnimInstanceClass(AnimClass.Class);
```

![캐릭터에 AnimInstanceClass를 연결하는 코드](./assets/images/animbp-class-link.jpg)

이제 흐름은 분명해진다.

- 캐릭터는 입력과 이동을 처리한다.
- `UPlayerAnimInstance`는 그 결과를 애님용 변수로 변환한다.
- 애님 블루프린트는 그 값을 받아 상태 전환과 포즈 출력을 담당한다.

### 1.5 장 정리

제1장의 결론은, 애니메이션도 게임플레이와 마찬가지로 "중간 레이어"가 있어야 유지보수가 쉽다는 점이다.
`UPlayerAnimInstance`는 플레이어와 애님 그래프를 이어 주는 해석 계층이다.

---

## 제2장. Aim Offset과 GroundLocomotion: 시선과 방향을 반영하는 기본 로코모션

### 2.1 시선 처리는 카메라 회전값을 그대로 몸에 옮기는 문제가 아니다

두 번째 강의부터는 애니메이션이 실제 플레이 감각을 어떻게 바꾸는지 본격적으로 드러난다.
Idle 상태에서 카메라가 보는 방향대로 상체와 시선을 자연스럽게 움직이게 만드는 도구가 `Aim Offset`이다.

자막에서도 나오듯, 핵심은 "카메라가 보는 방향을 그대로 복사"하는 것이 아니라, 축 값을 포즈 자산에 넣어 자연스럽게 보간하는 데 있다.
그래서 `Aim Offset`은 회전값 그 자체보다, 회전값을 읽을 수 있는 애님 변수 체계를 먼저 요구한다.

### 2.2 PlayerCharacter는 회전 입력을 AnimInstance에 넘긴다

실제 프로젝트에서 회전 입력은 `PlayerCharacter::RotationKey()`에서 처리된다.
이 함수는 스프링암 회전을 바꾸는 동시에, `mAnimInst->AddViewPitch()`, `AddViewYaw()`를 호출해 애님 쪽 시선 보정값도 갱신한다.

```cpp
void APlayerCharacter::RotationKey(const FInputActionValue& Value)
{
    FVector Axis = Value.Get<FVector>();

    mSpringArm->AddRelativeRotation(FRotator(Axis.Y, Axis.X, 0.0));

    mAnimInst->AddViewPitch(Axis.Y);
    mAnimInst->AddViewYaw(Axis.X);
}
```

즉 카메라 회전과 애님 시선 처리는 같은 입력에서 출발하지만, 엔진 안에서는 서로 다른 계층에서 소비된다.

### 2.3 Aim Offset 자산은 축 기반 포즈 보간기다

`Aim Offset` 자산은 여러 시선 포즈를 준비해 두고, 현재 `Pitch`, `Yaw` 축 값에 맞춰 중간 포즈를 보간한다.
이 구조는 이후 이동용 `Blend Space`와도 닮아 있다.
둘 다 축 값을 기반으로 포즈를 섞는다는 점에서는 같고, 차이는 `Aim Offset`이 시선 보정용이라는 데 있다.

![Aim Offset 자산 편집](./assets/images/aimoffset-asset.jpg)

애님 그래프 쪽에서는 이렇게 만든 자산을 조건에 따라 끼워 넣는다.
Idle 상태에서 시선을 보정할 때만 적용하고, 필요하면 다른 로코모션과 섞을 수 있게 분리해 둔다.

![Aim Offset 적용 그래프](./assets/images/aimoffset-apply.jpg)

### 2.4 GroundLocomotion은 Idle 하나로 끝나지 않는다

세 번째 강의는 Idle/이동 단순 전환에서 한 단계 더 나아간다.
실제 게임에서 캐릭터는 단순히 "멈춤"과 "달리기"만 가지지 않는다.
출발, 지속 이동, 멈춤, 방향 전환이 모두 따로 느껴져야 자연스럽다.

그래서 강의는 `GroundLocomotion` 상태 머신 안에 최소한 다음 구조를 제안한다.

- `Idle`
- `JogStart`
- `Run`
- `JogStop`

![GroundLocomotion 상태 머신](./assets/images/groundloco-state.jpg)

이 구조 덕분에 출발 모션과 멈춤 모션이 루프 이동과 분리되고, 결과적으로 캐릭터 움직임이 훨씬 덜 기계적으로 보인다.

### 2.5 속도만으로는 부족하고, 회전량도 필요하다

강의 후반은 로코모션을 더 자연스럽게 만들기 위해 `DeltaYaw`를 도입한다.
단순히 `MoveSpeed`만 보면 지금 달리고 있는지는 알 수 있지만, 얼마나 빠르게 몸을 틀고 있는지는 알 수 없다.
그래서 `UPlayerAnimInstance::NativeUpdateAnimation()`은 이전 프레임 회전과 현재 회전의 차이를 구해 `mYawDelta`를 계산한다.

```cpp
FRotator CurrentRot = PlayerChar->GetActorRotation();
FRotator DeltaRot = UKismetMathLibrary::NormalizedDeltaRotator(CurrentRot, mPrevRotator);
float DeltaYaw = DeltaRot.Yaw / DeltaSeconds / 7.f;
mYawDelta = FMath::FInterpTo(mYawDelta, DeltaYaw, DeltaSeconds, 6.f);
mPrevRotator = CurrentRot;
```

![로코모션 변수 코드](./assets/images/locomotion-view-vars.jpg)

이 값이 중요한 이유는 방향 전환이나 몸 기울기 보정 같은 미세한 반응이 "속도"보다 "회전 변화량"에 더 가깝기 때문이다.

### 2.6 시작 모션과 방향별 로코모션은 Blend Space가 맡는다

강의는 방향별 시작 모션과 이동 모션을 `Blend Space`로 정리한다.
앞, 좌, 우, 뒤쪽 출발 모션과 러닝 포즈를 넣어 두면, 캐릭터가 어느 방향으로 움직이기 시작하는지에 따라 중간 포즈까지 자연스럽게 섞을 수 있다.

![JogStart용 이동 자산 미리보기](./assets/images/jogstart-preview.jpg)

즉 `Aim Offset`이 시선 보정용 축 자산이라면, `Blend Space`는 이동 보정용 축 자산이다.
둘 다 "값에 따라 포즈를 섞는다"는 공통 원리를 공유한다.

### 2.7 장 정리

제2장은 플레이어가 "움직이기 시작하는 몸"을 만든다.
카메라 시선은 `Aim Offset`, 이동과 방향 전환은 `GroundLocomotion + Blend Space + DeltaYaw`가 맡는다.

---

## 제3장. Jump 로코모션: 캐시 포즈와 점프 상태 머신으로 공중 흐름 만들기

### 3.1 점프는 물리 기능이 아니라 애니메이션 흐름 문제다

네 번째 강의의 출발점은 명확하다.
스페이스를 누르면 실제로 튀어 오르는 물리 이동은 이미 만들어져 있다.
지금 부족한 것은 공중으로 뜰 때, 공중에 있을 때, 착지할 때를 각각 다른 애니메이션 흐름으로 표현하는 일이다.

그래서 이 강의는 "새 점프 기능 추가"가 아니라, 이미 있는 점프 기능에 애니메이션 상태를 연결하는 작업에 가깝다.

### 3.2 Save Cached Pose는 GroundLoco를 재활용 가능하게 만든다

점프 파트에서 먼저 만드는 구조는 `GroundLoco` 캐시 포즈다.
애니메이션 그래프에서 지상 로코모션 결과를 한 번 저장해 두고, 나중에 다른 상태에서 다시 꺼내 쓸 수 있게 만든다.

자막에서도 강조하듯, 이 구조는 점프나 착지처럼 "지상 포즈 위에 무언가를 덧입히는" 경우에 특히 유용하다.

### 3.3 점프는 별도 상태 머신으로 분리해야 한다

강의는 `GroundLoco`만 있던 상위 구조에 별도 `Jump` 상태를 추가한다.
그리고 그 안에 또 작은 상태 머신을 둬서 `JumpStart`, `JumpApex`, `JumpLand`를 분리한다.

![Jump 상태 머신](./assets/images/jump-state-machine.jpg)

이렇게 나누는 이유는 점프를 하나의 긴 모션으로 취급하면 현실적인 공중 흐름을 표현하기 어렵기 때문이다.

- `JumpStart`: 이륙
- `JumpApex`: 공중 유지
- `JumpLand`: 착지 충격

결국 점프도 로코모션과 마찬가지로 상태 분해가 핵심이다.

### 3.4 공중 상태 판정은 결국 mIsInAir로 이어진다

`UPlayerAnimInstance::NativeUpdateAnimation()`는 `Movement->IsFalling()`을 읽어 `mIsInAir`를 갱신한다.
애님 그래프는 이 값을 이용해 지상 상태와 점프 상태를 분리한다.

즉 플레이어 캐릭터 쪽 캐릭터 무브먼트가 물리 상태를 계산하고, 애님 인스턴스가 이를 애님 변수로 바꾸고, 상태 머신은 그 값을 보고 전환을 결정하는 구조가 완성된다.

### 3.5 착지는 Additive로 보정하는 것이 더 자연스럽다

강의 후반의 좋은 포인트는 착지를 별도 풀바디 모션으로만 처리하지 않는다는 점이다.
`JumpLand` 안에서 `GroundLoco` 캐시 포즈를 베이스로 쓰고, `Jump_Recovery_Additive`를 `Apply Additive`로 얹어 착지 충격만 보정한다.

![JumpLand 애디티브 구성](./assets/images/jump-land-additive.jpg)

이 방식의 장점은 분명하다.

- 지상 로코모션과의 연결이 자연스럽다.
- 착지 반응만 강조할 수 있다.
- 나중에 강도나 보간 값을 조절하기 쉽다.

즉 착지는 단순히 "점프 끝"이 아니라, 지상 로코모션으로 복귀하는 과도기 상태로 다루는 편이 훨씬 좋다.

### 3.6 실제 테스트는 상태 연결이 제대로 붙었는지를 확인하는 단계다

강의 마지막은 결국 플레이 테스트다.
공중 판정이 잘 들어가는지, 착지 타이밍이 어색하지 않은지, 상태 전환이 너무 급하지 않은지를 반복 확인한다.

![점프 플레이테스트](./assets/images/jump-playtest.jpg)

이 지점이 중요한 이유는 애니메이션 구조가 "코드가 맞다"로 끝나지 않기 때문이다.
전환 시간, 애디티브 강도, 복귀 타이밍은 결국 화면에서 읽어야 한다.

### 3.7 장 정리

제3장은 플레이어를 진짜 입체적인 이동 객체로 만든다.
점프는 단순한 한 동작이 아니라, 지상 로코모션과 분리된 별도 상태 머신이며, 착지는 캐시 포즈와 애디티브를 이용해 부드럽게 복귀시켜야 한다.

---

## 전체 정리

`260407`을 층으로 다시 정리하면 다음과 같다.

1. `UPlayerAnimInstance`가 플레이어와 애님 그래프 사이의 중간 레이어를 만든다.
2. `MoveSpeed`, `ViewPitch`, `ViewYaw`, `mYawDelta`, `mIsInAir`가 애님 상태를 설명하는 공용 변수 역할을 한다.
3. `Aim Offset`이 시선 보정을, `GroundLocomotion`과 `Blend Space`가 이동 방향과 전환을 맡는다.
4. `Jump` 상태 머신과 `GroundLoco` 캐시 포즈, `Apply Additive`가 공중 흐름과 착지 복귀를 완성한다.

즉 이번 날짜는 `260408`의 몽타주/노티파이 강의와 `260409`의 전투 파이프라인 강의가 올라갈 바닥을 만드는 날이다.

## 복습 체크리스트

- 애님 블루프린트가 왜 `AnimInstance` 기반 중간 C++ 클래스를 필요로 하는지 설명할 수 있는가
- `RotationKey()`에서 카메라 회전과 `AddViewPitch`, `AddViewYaw`가 함께 갱신되는 이유를 말할 수 있는가
- `Aim Offset`과 `Blend Space`가 둘 다 축 기반 자산이지만 용도가 다르다는 점을 설명할 수 있는가
- `GroundLocomotion`을 `Idle`, `JogStart`, `Run`, `JogStop`으로 나누는 이유를 설명할 수 있는가
- `mYawDelta`가 단순 이동 속도와 별개로 필요한 이유를 말할 수 있는가
- `JumpStart`, `JumpApex`, `JumpLand`, `GroundLoco` 캐시 포즈, `Apply Additive`가 점프 흐름에서 각각 무엇을 맡는지 설명할 수 있는가

## 세미나 질문

1. 애니메이션을 전부 블루프린트로만 짜지 않고 `UPlayerAnimInstance` 같은 C++ 중간 레이어를 두는 장점은 무엇일까
2. 시선 보정을 `Aim Offset`으로 처리하지 않고 단순 상체 회전만 적용하면 어떤 한계가 생길까
3. 방향 전환과 몸의 기울기를 표현할 때 왜 `MoveSpeed`보다 `DeltaYaw` 같은 회전 변화량이 더 유용할까
4. 착지를 완전한 독립 풀바디 모션으로 처리하는 방식과, 캐시 포즈 + 애디티브로 처리하는 방식은 어떤 차이를 만들까

## 권장 과제

1. `GroundLocomotion` 안에 `JogStart`뿐 아니라 방향별 시작 모션을 더 넣고 전환 체감을 비교해 본다.
2. `mYawDelta` 보간 속도를 조절해 회전 반응이 얼마나 민감하게 보이는지 기록한다.
3. `JumpLand`의 애디티브 강도를 바꿔 착지 충격이 어느 수준에서 가장 자연스러운지 확인한다.
4. 같은 구조를 `Wraith`에도 적용해 애님 블루프린트/캐릭터 클래스 연결이 캐릭터별로 어떻게 확장되는지 정리해 본다.
