---
title: 260414 01 MonsterBase와 Pawn 구조
---

# 260414 01 MonsterBase와 Pawn 구조

[260414 허브](../) | [다음: 02 AIController, AIPerception, NavMesh](../02_intermediate_aicontroller_perception_and_navmesh/)

## 문서 개요

첫 강의의 목표는 몬스터를 "캐릭터처럼 보이는 메시"가 아니라, `AI가 움직이고 감지할 수 있는 Pawn 본체`로 다시 세우는 데 있다.

## 1. 왜 `Character`가 아니라 `Pawn`인가

강의의 첫 판단은 몬스터를 `ACharacter`가 아니라 `APawn`으로 시작한다는 점이다.
이 선택 덕분에 어떤 컴포넌트가 왜 필요한지 한 단계씩 직접 붙이며 볼 수 있다.

![MonsterBase 클래스 생성](../assets/images/monsterbase-class-create.jpg)

즉 이번 날짜는 "편한 기본값"보다 "구조를 직접 조립하며 이해하는 것"을 더 우선한다.

## 2. `MonsterBase`는 Body, Mesh, Movement를 직접 조립한다

실제 `AMonsterBase` 생성자에서 가장 먼저 하는 일은 본체를 조립하는 것이다.

```cpp
mBody = CreateDefaultSubobject<UCapsuleComponent>(TEXT("Body"));
mMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("Mesh"));

SetRootComponent(mBody);
mMesh->SetupAttachment(mBody);

mMovement = CreateDefaultSubobject<UFloatingPawnMovement>(TEXT("Movement"));
mMovement->SetUpdatedComponent(mBody);
```

![MonsterBase 컴포넌트 구성](../assets/images/monsterbase-components.jpg)

![강의에서 `AMonsterBase` 생성자 컴포넌트를 직접 붙이는 장면](../assets/images/monsterbase-constructor-code-live.jpg)

여기서 읽어야 할 핵심은 세 가지다.

- `mBody`: 실제 충돌과 이동 기준이 되는 캡슐
- `mMesh`: 시각적으로 보이는 스켈레탈 메시
- `mMovement`: `Pawn`을 실제로 움직이게 하는 최소 이동 컴포넌트

즉 `MonsterBase`는 메시 하나를 놓는 클래스가 아니라, `몸체 + 시각 표현 + 이동 기준`을 분리해서 조립하는 클래스다.

## 3. 네비게이션과 AI 빙의를 위한 기본 설정이 같이 들어간다

생성자에는 눈에 덜 띄지만 아주 중요한 설정이 같이 들어 있다.

```cpp
mBody->SetCanEverAffectNavigation(false);
mMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
mBody->SetCollisionProfileName(TEXT("Monster"));

AIControllerClass = AMonsterController::StaticClass();
AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;

SetGenericTeamId(FGenericTeamId(TeamMonster));
bUseControllerRotationYaw = true;
```

![네비게이션과 기본 AI 설정을 정리하는 장면](../assets/images/monsterbase-nav-setting.jpg)

이 설정이 의미하는 바는 명확하다.

- 몬스터 자신의 캡슐이 NavMesh를 다시 굽는 장애물이 되지 않게 한다.
- 실제 충돌 몸체는 `mBody`가 맡고, 메시는 기본적으로 충돌을 끈다.
- 이 Pawn은 시작부터 `AMonsterController`가 빙의하는 대상이 된다.

즉 `260414`의 `MonsterBase`는 단순 부모 클래스가 아니라, 이후 AI가 붙어도 흔들리지 않는 공통 본체를 만드는 단계다.

## 4. 현재 branch에서도 같은 뼈대가 `AMonsterGAS`로 이어진다

현재 저장소의 `AMonsterGAS`도 시작점은 거의 같다.
여전히 `APawn`을 부모로 쓰고, `Body`, `Mesh`, `Movement`를 직접 조립하며, `AIControllerClass`와 `AutoPossessAI`를 세팅한다.

다만 지금은 그 위에 `ASC`와 `AttributeSet`이 추가된다.

```cpp
AIControllerClass = AMonsterGASController::StaticClass();
AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;

mASC = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("ASC"));
mAttributeSet = CreateDefaultSubobject<UMonsterAttributeSet>(TEXT("AttributeSet"));
mASC->AddAttributeSetSubobject<UMonsterAttributeSet>(mAttributeSet);
```

즉 `260414`의 설계는 폐기된 것이 아니라, 현재 branch에서 `Pawn 본체` 위에 `GAS 전투 계층`이 한 겹 더 얹힌 구조로 확장된 셈이다.

## 정리

첫 강의의 핵심은 몬스터를 `AI가 조종할 수 있는 Pawn`으로 정확히 세우는 것이다.
이 바닥이 있어야 다음 편의 `NavMesh`, `Perception`, `Behavior Tree`, `DataTable`이 흔들리지 않는다.

[260414 허브](../) | [다음: 02 AIController, AIPerception, NavMesh](../02_intermediate_aicontroller_perception_and_navmesh/)
