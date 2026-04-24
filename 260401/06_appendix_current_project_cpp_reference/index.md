---
title: 260401 부록 2 - 현재 프로젝트 C++로 다시 읽는 첫날 개념
---

# 부록 2. 현재 프로젝트 C++로 다시 읽는 첫날 개념

[이전: 부록 1](../05_appendix_official_docs_reference/) | [허브](../) | [다음 날짜: 260402](../../260402/)

## 이 편의 목표

이 부록은 첫날에 배운 `Character`, `Pawn`, `GameMode`, `PlayerController`, `BeginPlay`, `Tick` 같은 개념이 실제 `UE20252` 소스에서 어떤 모습으로 보이는지 연결해 두기 위한 정리다.
즉 블루프린트 입문에서 멈추지 않고, 뒤 날짜에서 나오는 C++ 파일 이름들을 덜 낯설게 만들기 위한 브리지 문서다.

## 봐야 할 파일

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerCharacter.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerCharacter.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\MonsterBase.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\MonsterBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GameMode\DefaultGameMode.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\MainPlayerController.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\Shinbi.cpp`

## `APlayerCharacter`는 왜 `Character`가 편한지 보여 준다

플레이어 공통 베이스 `APlayerCharacter`는 `ACharacter`를 상속한다.
즉 처음부터 캡슐, 메시, 이동 기능 같은 기본 뼈대를 이미 들고 들어온다.

```cpp
class UE20252_API APlayerCharacter : public ACharacter,
    public IGenericTeamAgentInterface
{
    GENERATED_BODY()

protected:
    TObjectPtr<USpringArmComponent> mSpringArm;
    TObjectPtr<UCameraComponent> mCamera;
    TObjectPtr<class UPlayerAnimInstance> mAnimInst;
};
```

즉 첫날 강의에서 말한 “플레이어는 보통 `Character`를 쓰는 편이 자연스럽다”는 설명이 실제 소스에서도 그대로 드러난다.

## `AMonsterBase`는 `Pawn`이 더 직접 조립형이라는 점을 보여 준다

몬스터 베이스는 `ACharacter`가 아니라 `APawn`을 상속한다.
그래서 몸체 충돌, 메시, 이동 컴포넌트, AI 컨트롤러 연결을 더 직접 조립하는 느낌이 강하다.

```cpp
class UE20252_API AMonsterBase : public APawn,
    public IGenericTeamAgentInterface,
    public IMonsterState
{
    GENERATED_BODY()

protected:
    TObjectPtr<UCapsuleComponent> mBody;
    TObjectPtr<USkeletalMeshComponent> mMesh;
    TObjectPtr<UFloatingPawnMovement> mMovement;
};
```

즉 `Pawn`은 더 가볍고 자유로운 대신, 필요한 부품을 더 직접 준비해야 한다는 첫날 강의의 설명이 여기서 바로 확인된다.

## `GameMode`와 `PlayerController`는 월드 규칙과 조종 주체를 나눈다

`ADefaultGameMode`는 이 월드의 기본 플레이어와 기본 컨트롤러를 정한다.

```cpp
DefaultPawnClass = AShinbi::StaticClass();
PlayerControllerClass = AMainPlayerController::StaticClass();
```

반면 `AMainPlayerController`는 입력과 마우스, 화면 조작 같은 “조종”을 맡는다.

```cpp
AMainPlayerController::AMainPlayerController()
{
    PrimaryActorTick.bCanEverTick = true;
    bShowMouseCursor = true;
}
```

즉 첫날 강의의 핵심 중 하나였던 “조종 대상과 조종 주체를 분리한다”는 구조가 프로젝트 소스에서도 그대로 보인다.

## `AShinbi`는 공통 플레이어 베이스가 실제 캐릭터로 구체화되는 예다

`AShinbi`는 공통 `APlayerCharacter` 구조 위에 실제 메시, 위치 보정, 애니메이션 블루프린트를 얹은 구체 캐릭터다.
즉 상속은 기능을 복붙하는 것이 아니라, 공통 틀 위에 캐릭터별 차이를 올리는 방식이라는 감각을 여기서 잡을 수 있다.

이 관점은 뒤 날짜에서 다른 플레이어/몬스터 파생 클래스를 볼 때도 그대로 이어진다.

## `BeginPlay`, `Tick`, 입력 바인딩은 블루프린트와 거의 같은 이름으로 반복된다

첫날 블루프린트에서 `BeginPlay`, `Tick`을 배웠다면, 현재 프로젝트 C++도 거의 같은 이름의 함수로 생명주기를 다룬다.

```cpp
virtual void BeginPlay() override;
virtual void Tick(float DeltaTime) override;
```

그리고 입력 액션은 `SetupPlayerInputComponent()`에서 `BindAction()`으로 연결된다.
즉 블루프린트 이벤트 노드가 하던 역할을, C++에서는 함수와 바인딩 코드로 직접 쓴다고 보면 된다.

이 대응 관계를 알고 있으면 뒤의 `260406`, `260410`, `260421`에서 C++ 흐름을 읽을 때 훨씬 덜 막힌다.

## 첫날 개념을 지금 프로젝트 기준으로 다시 요약하면

- `Character`
  플레이어처럼 기본 이동 부품이 많은 대상
- `Pawn`
  몬스터처럼 더 직접 조립하는 대상
- `GameMode`
  기본 폰과 컨트롤러를 정하는 월드 규칙
- `PlayerController`
  입력과 빙의를 담당하는 조종 주체
- `BeginPlay` / `Tick`
  블루프린트와 C++ 모두에서 반복되는 기본 생명주기

즉 `260401`은 블루프린트 입문 강의이면서 동시에, 지금 프로젝트 C++를 읽기 위한 기초 사전이기도 하다.

## 이 편의 핵심 정리

1. 첫날에 배운 언리얼 클래스 구조는 `UE20252` 소스에서도 거의 그대로 보인다.
2. `APlayerCharacter`와 `AMonsterBase` 비교만 봐도 `Character`와 `Pawn` 차이가 선명해진다.
3. `ADefaultGameMode`, `AMainPlayerController`, `AShinbi`를 보면 월드 규칙, 조종 주체, 구체 캐릭터가 어떻게 나뉘는지 바로 읽힌다.

