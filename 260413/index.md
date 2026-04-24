---
title: 260413 Mouse Picking, 마법진 지정형 스킬, Geometry Collection으로 위치 기반 파괴 연출을 만드는 날
---

# 260413 Mouse Picking, 마법진 지정형 스킬, Geometry Collection으로 위치 기반 파괴 연출을 만드는 날

## 문서 개요

이 문서는 `260413_1_Mouse Picking`, `260413_2_스킬 캐스팅 및 발사`, `260413_3_Geometry Collection`, `260413_4_GeometryCollection C++` 강의를 하나의 연속된 교재로 다시 엮은 것이다.
이번 날짜의 핵심은 마우스로 월드 위치를 지정하고, 그 지점을 데칼로 미리 보여 준 뒤, 결국 그 좌표에 실제 파괴 가능한 액터를 떨어뜨리는 "위치 기반 스킬 파이프라인"을 만드는 데 있다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`마우스 커서 -> GetHitResultUnderCursor -> 마법진 데칼 -> Skill1 발사 -> GeometryActor 생성 -> ApplyExternalStrain으로 파괴`

즉 `260413`은 캐릭터 앞 방향으로만 공격하던 구조에서 벗어나, 플레이어가 월드의 특정 지점을 고르고 그곳에 효과를 발생시키는 지정형 스킬 구조를 다루는 날이다.

이 교재는 다음 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상과 자막
- 원본 MP4에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`의 덤프 결과
- Epic Developer Community의 언리얼 공식 문서

## 학습 목표

- `bShowMouseCursor`, `FInputModeGameAndUI`, `GetHitResultUnderCursor()`가 Mouse Picking 구조의 출발점이라는 점을 설명할 수 있다.
- 2D 마우스 좌표가 어떻게 3D 월드 충돌 지점으로 바뀌는지 큰 흐름을 설명할 수 있다.
- `Shinbi::Skill1Casting()`이 마우스 위치에 마법진 데칼을 생성하고, `Tick()`이 그 데칼을 갱신하는 구조를 설명할 수 있다.
- `InputAttack()`에서 평타와 스킬 발사를 분기하는 이유와 `mMagicCircleActor`의 의미를 설명할 수 있다.
- `Geometry Collection`, `Fracture`, `Damage Threshold`, `Collision Damage`, `ApplyExternalStrain`이 어떤 관계를 가지는지 설명할 수 있다.
- `UGeometryCollectionComponent`, `SetRestCollection`, `OnComponentHit`, `Hit.Item` 기반 파괴 흐름을 C++ 기준으로 설명할 수 있다.
- `UE20252.Build.cs`에 `GeometryCollectionEngine`, `Chaos`, `FieldSystemEngine` 모듈이 필요한 이유를 설명할 수 있다.

## 강의 흐름 요약

1. 먼저 컨트롤러에서 마우스 커서를 보이게 하고, 월드 안에서 커서가 가리키는 표면 위치를 `HitResult`로 얻는다.
2. Shinbi는 캐스팅 시점에 그 위치에 마법진 데칼을 생성하고, 커서가 움직이면 `Tick()`에서 그 데칼 위치를 계속 갱신한다.
3. 공격 입력이 다시 들어오면, 기존 평타 대신 마법진 위치를 기준으로 스킬 액터를 생성한다.
4. 그 스킬 액터는 `Geometry Collection`을 가진 파괴 오브젝트이고, 충돌 시 `ApplyExternalStrain()`으로 실제 파괴 반응을 일으킨다.
5. 즉 이번 날짜는 `Picking -> Marker -> Spawn -> Destruction` 네 단계를 묶어 위치 기반 스킬의 전체 골격을 만든다.

## 2026-04-23 덤프 반영 메모

이번 덤프 재확인으로 `260413`은 “마우스로 찍고 깨뜨리는 응용 강의”가 아니라, 컨트롤러 입력 모드부터 파괴 자산 세팅까지 이어지는 완성형 파이프라인이라는 점이 더 또렷해졌다.

- `MainPlayerController_SourceDump.txt`
  `AMainPlayerController`는 `bShowMouseCursor = true`를 켜고 `FInputModeGameAndUI`를 사용한다. 즉 마우스 피킹은 이 날짜에 갑자기 나온 요령이 아니라, 컨트롤러 레벨에서 이미 준비된 입력 모드 위에서 돌아간다.
- `Shinbi_SourceDump.txt`
  `AShinbi`는 `mMagicCircleActor`를 멤버로 들고 있고 `DecalBase.h`, `GeometryActor.h`를 직접 포함한다. 캐스팅 마커와 파괴 액터 스폰이 실제로 같은 캐릭터 흐름 안에 묶여 있다는 뜻이다.
- `MTShibiMagicCircle_MaterialDump.txt`
  마법진은 `DeferredDecal` 머티리얼이고 `MagicCircle` 텍스처를 쓴다. 즉 현재 프로젝트의 스킬 마커는 디버그 도형이 아니라 정식 데칼 자산이다.
- `GeometryActor_SourceDump.txt`, `GC_SM_PROP_barrel_dungeon_01_AssetDump.txt`
  `AGeometryActor`는 `UGeometryCollectionComponent`를 루트로 두고 `SetGeometryAsset()`를 제공한다. 실제 배럴 Geometry Collection은 `EnableClustering = True`, `DamageThreshold = (1000000, 100000, 10000)`, `Mass = 2500`으로 잡혀 있어, 파괴 연출이 에디터 장난감이 아니라 조절된 물리 자산이라는 점도 확인된다.

---

## 제1장. Mouse Picking: 2D 마우스 좌표로 3D 월드 위치를 어떻게 집어낼 것인가

### 1.1 Picking은 에디터에서 자연스럽지만, 게임 안에서는 직접 설계해야 한다

첫 강의는 `Mouse Picking`이다.
자막에서도 강조하듯, 에디터에서는 마우스로 3D 오브젝트를 고르는 일이 너무 당연해서 잊기 쉽지만, 게임 안에서는 이 과정을 우리가 직접 열어 줘야 한다.

핵심 질문은 간단하다.

- 마우스는 2D 좌표만 갖는다.
- 그런데 게임은 3D 월드다.
- 그러면 어떤 바닥 위치를 스킬 목표점으로 쓸지 어떻게 구할 것인가?

이 질문에 대한 엔진 수준 답이 바로 `GetHitResultUnderCursor()`다.

### 1.2 현재 `AMainPlayerController`는 Picking의 기반을 아주 깔끔하게 준비한다

현재 컨트롤러 코드는 짧지만 중요하다.

```cpp
AMainPlayerController::AMainPlayerController()
{
    // 컨트롤러도 Tick을 돌게 하고
    PrimaryActorTick.bCanEverTick = true;
    // 플레이어가 월드 위치를 찍을 수 있도록 마우스 커서를 보인다.
    bShowMouseCursor = true;
}

void AMainPlayerController::BeginPlay()
{
    Super::BeginPlay();

    // 게임 조작과 UI 포인터 입력을 함께 받을 수 있게 한다.
    FInputModeGameAndUI InputMode;
    SetInputMode(InputMode);
}
```

![`AMainPlayerController` 생성자에서 마우스 커서를 활성화하는 장면](./assets/images/mainplayercontroller-show-mouse-cursor.png)

![`BeginPlay()`에서 `FInputModeGameAndUI`를 준비하는 장면](./assets/images/mainplayercontroller-input-mode-game-and-ui.png)

이 두 설정이 의미하는 바는 분명하다.

- `bShowMouseCursor = true`: 플레이어가 실제로 목표 지점을 찍을 수 있게 한다.
- `FInputModeGameAndUI`: 게임 월드 조작과 UI 포인터 사용을 함께 허용한다.

즉 지정형 스킬을 만들려면, 먼저 컨트롤러가 "마우스 커서를 가진 플레이어"라는 상태로 바뀌어야 한다.

### 1.3 `GetHitResultUnderCursor()`는 마우스 아래의 충돌 지점을 돌려준다

컨트롤러 `Tick()`은 다음처럼 매우 직접적으로 구성돼 있다.

```cpp
void AMainPlayerController::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // 커서 아래로 레이를 쏴서 월드 충돌 결과를 받는다.
    FHitResult Hit;
    bool Pick = GetHitResultUnderCursor(
        ECollisionChannel::ECC_GameTraceChannel5,
        true,
        Hit);
}
```

![`Tick()`에서 `GetHitResultUnderCursor()` 호출을 배치한 장면](./assets/images/mainplayercontroller-get-hit-result-under-cursor.png)

![`Hit.ImpactPoint`를 디버그 출력으로 확인하는 장면](./assets/images/mainplayercontroller-impact-point-debug.png)

이 함수는 "커서 아래 픽셀"을 직접 돌려주는 것이 아니라, 그 방향으로 레이를 쏴서 맞은 월드 표면 정보를 `HitResult`로 돌려준다.
그래서 우리가 진짜로 쓰게 되는 값은 다음과 같다.

- `Hit.ImpactPoint`: 실제 맞은 월드 위치
- `Hit.ImpactNormal`: 그 표면의 방향
- `Hit.Actor / Component`: 무엇을 맞았는지

즉 Picking은 2D 좌표를 그대로 쓰는 일이 아니라, `화면 좌표 -> 월드 레이 -> 충돌 결과`로 번역하는 작업이다.

### 1.4 왜 컨트롤러가 Picking을 맡는가

Mouse Picking을 캐릭터가 아니라 컨트롤러가 먼저 준비하는 설계도 의미가 있다.
커서와 입력 모드는 플레이어 조작 문맥에 더 가깝기 때문이다.

이렇게 역할을 나누면 장점이 있다.

- 컨트롤러는 입력 장치와 커서 상태를 관리한다.
- 캐릭터는 그 결과로 얻은 위치를 어떻게 쓸지 결정한다.

즉 이번 날짜는 "좌표 계산"과 "스킬 행동"을 억지로 섞지 않고, 컨트롤러와 캐릭터 책임을 분리하는 예제이기도 하다.

### 1.5 장 정리

제1장의 결론은 Mouse Picking이 단순 편의 기능이 아니라는 점이다.
지정형 스킬, 클릭 이동, 월드 선택, RTS식 조작처럼 "마우스로 월드 지점을 고르는" 거의 모든 기능의 바닥이 된다.

---

## 제2장. 스킬 캐스팅 및 발사: 마법진 데칼은 왜 Tick으로 따라다녀야 하는가

### 2.1 Shinbi는 캐스팅 후 "목표 지점 표시 상태"로 들어간다

두 번째 강의는 바로 앞 날짜 `260410`에서 만든 캐스팅 모션을 실제 위치 지정 스킬로 확장한다.
자막에서도 흐름이 분명하다.
`Skill1`은 일단 캐스팅 모션을 재생하고, 그 뒤 실제 발사는 마우스로 지정한 위치를 기준으로 일어나게 만든다.

이 구조가 중요한 이유는 스킬을 두 단계로 나누기 때문이다.

1. 스킬 준비와 타깃 지정
2. 실제 발사/생성

즉 이제 스킬은 버튼 하나를 누른다고 곧바로 터지지 않는다.
플레이어가 어디에 쓸지 먼저 고르는 시간이 생긴다.

### 2.2 `Skill1Casting()`은 마우스 위치에 마법진 데칼을 생성한다

현재 `AShinbi::Skill1Casting()`은 바로 그 준비 단계를 맡는다.

```cpp
void AShinbi::Skill1Casting()
{
    // 커서 위치를 읽어 올 플레이어 컨트롤러를 찾는다.
    TObjectPtr<APlayerController> PlayerCtrl = GetController<APlayerController>();

    // 현재 커서가 가리키는 월드 지점을 구한다.
    FHitResult Hit;
    bool Pick = PlayerCtrl->GetHitResultUnderCursor(
        ECollisionChannel::ECC_GameTraceChannel5, true, Hit);

    FVector DecalLoc;
    // 맞은 위치가 있다면 그 지점을 마법진 기준점으로 쓴다.
    if (Pick)
        DecalLoc = Hit.ImpactPoint;

    // 마법진 데칼은 겹치더라도 생성되게 한다.
    FActorSpawnParameters Param;
    Param.SpawnCollisionHandlingOverride =
        ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    // 커서 위치에 마법진 데칼 액터를 만든다.
    TObjectPtr<ADecalBase> DecalActor =
        GetWorld()->SpawnActor<ADecalBase>(
            DecalLoc, FRotator(-90.0, 0.0, 0.0), Param);

    // Shinbi 전용 마법진 머티리얼을 적용한다.
    DecalActor->SetDecalMaterial(
        TEXT("/Script/Engine.Material'/Game/Player/Shinbi/Material/MTShibiMagicCircle.MTShibiMagicCircle'"));

    // 이후 Tick과 발사 단계가 참조할 수 있게 멤버에 저장한다.
    mMagicCircleActor = DecalActor;
}
```

![`AShinbi::Skill1Casting()` 엔트리를 추가하는 장면](./assets/images/shinbi-skill1casting-entry.png)

![Shinbi 전용 `MTShibiMagicCircle` 머티리얼을 에디터에서 확인하는 장면](./assets/images/shinbi-magic-circle-material.jpg)

![커서 위치에 `ADecalBase` 마법진 액터를 스폰하는 장면](./assets/images/shinbi-spawn-magic-circle-actor.png)

이 함수는 매우 많은 것을 동시에 보여 준다.

- 캐릭터도 컨트롤러의 Picking 결과를 바로 사용할 수 있다.
- 지정 위치는 `Hit.ImpactPoint` 하나로 충분하다.
- 월드의 시각적 목표점은 `ADecalBase`로 표현할 수 있다.
- 회전값 `-90`도는 바닥 투영 방향을 맞추기 위한 것이다.

즉 이번 강의는 데칼을 다시 "피격 자국"이 아니라 "스킬 목표 UI"로 재해석하는 순간이기도 하다.

### 2.3 `Tick()`은 마우스가 움직이는 동안 마법진을 계속 갱신한다

마법진이 한 번 생성되고 끝나면 지정형 스킬로서 너무 불편하다.
플레이어는 보통 캐스팅 뒤 커서를 움직여 목표점을 조정하고 싶기 때문이다.
그 역할을 `AShinbi::Tick()`이 맡는다.

```cpp
void AShinbi::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // 현재 마법진이 존재할 때만 목표 위치를 갱신한다.
    if (IsValid(mMagicCircleActor))
    {
        TObjectPtr<APlayerController> PlayerCtrl = GetController<APlayerController>();

        // 다시 커서 아래 월드 위치를 읽는다.
        FHitResult Hit;
        bool Pick = PlayerCtrl->GetHitResultUnderCursor(
            ECollisionChannel::ECC_GameTraceChannel5, true, Hit);

        if (Pick)
        {
            // 마법진을 최신 커서 위치로 계속 옮긴다.
            mMagicCircleActor->SetActorLocation(Hit.ImpactPoint);
        }
    }
}
```

이 구조가 중요한 이유는 마법진이 "고정 이펙트"가 아니라 "현재 타깃 후보"를 보여 주는 인터랙티브 오브젝트이기 때문이다.
즉 캐스팅 상태에서는 Tick이 사실상 조준 UI 역할을 한다.

### 2.4 `InputAttack()`은 마법진 존재 여부로 평타와 스킬 발사를 분기한다

이번 날짜의 가장 교육적인 부분은 공격 입력이 하나인데도, 현재 상태에 따라 행동이 달라진다는 점이다.
`AShinbi::InputAttack()`은 그 분기를 아주 명확하게 보여 준다.

```cpp
void AShinbi::InputAttack()
{
    // 마법진이 있으면 지금은 평타가 아니라 지정형 스킬 상태다.
    if (IsValid(mMagicCircleActor))
    {
        // 스킬 발사용 애니메이션을 재생하고 인덱스를 정리한다.
        mAnimInst->PlaySkill1();
        mAnimInst->ClearSkill1();

        // 마법진 위치 위 상공에서 파괴 액터를 떨어뜨릴 준비를 한다.
        FVector Loc = mMagicCircleActor->GetActorLocation() + FVector(0.0, 0.0, 1000.0);

        FActorSpawnParameters Param;
        Param.SpawnCollisionHandlingOverride =
            ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

        // 실제 스킬 결과물인 GeometryActor를 만든다.
        TObjectPtr<AGeometryActor> SkillActor =
            GetWorld()->SpawnActor<AGeometryActor>(Loc, FRotator::ZeroRotator, Param);

        // 파괴 가능한 Geometry Collection 자산을 연결한다.
        SkillActor->SetGeometryAsset(
            TEXT("/Script/GeometryCollectionEngine.GeometryCollection'/Game/Blueprints/GC_SM_PROP_barrel_dungeon_01.GC_SM_PROP_barrel_dungeon_01'"));

        // 한 번 발사했으면 마법진은 없앤다.
        mMagicCircleActor->Destroy();
    }
    else
    {
        // 마법진이 없으면 평소처럼 평타를 재생한다.
        mAnimInst->PlayAttack();
    }
}
```

이 함수는 상태 머신을 아주 작게 압축해 보여 준다.

- `mMagicCircleActor`가 없으면: 평타
- `mMagicCircleActor`가 있으면: 지정형 스킬 발사

즉 마법진 액터는 단순 시각 효과가 아니라, "지금 Shinbi가 스킬 타깃 지정 상태인가"를 나타내는 상태 플래그 역할도 한다.

![몽타주 타임라인에서 `SkillCasting` 노티파이 시점을 확인하는 장면](./assets/images/shinbi-skillcasting-notify-timeline.png)

### 2.5 현재 강의는 의도적으로 캔슬 규칙을 단순화한다

자막에서도 반복해서 말하듯, 평타 캔슬과 스킬 캔슬 규칙은 아직 세밀하게 정리되지 않았다.
현재 구현은 일단 캐스팅과 발사 흐름이 보이도록 최소 구조를 먼저 만든 상태다.

이 판단이 좋은 이유는 학습 순서를 지키기 때문이다.

- 먼저 목표 지정을 붙인다.
- 다음에 발사 액터를 붙인다.
- 그 뒤 세부 게임 규칙을 다듬는다.

즉 이번 날짜는 "완성형 전투 규칙"보다 "지정형 스킬 구조를 눈에 보이게 만드는 것"이 우선이다.

### 2.6 장 정리

제2장의 결론은 마법진 데칼이 단순 효과가 아니라는 점이다.
지정형 스킬의 목표점 UI이자, 평타와 스킬 발사를 나누는 상태 신호이자, 이후 실제 액터 스폰 위치를 결정하는 기준점이다.

---

## 제3장. Geometry Collection: 부서지는 메시를 에디터 관점에서 어떻게 이해해야 하는가

### 3.1 Geometry Collection은 "그냥 메시"가 아니라 파괴용 데이터 구조다

세 번째 강의는 `Geometry Collection`을 다룬다.
자막에서도 먼저 `Fracture` 모드를 열고, 일반 스태틱 메시를 그대로 쓰는 것이 아니라 "부서지기 위한 전용 에셋"으로 바꾸는 과정을 보여 준다.

이 지점이 중요하다.
파괴 연출은 단순히 메시를 숨기고 조각 파티클을 뿌리는 것과 다르다.
어떤 조각이 어느 수준에서, 어느 힘으로 분리될지에 대한 데이터가 필요하다.

그 데이터가 들어 있는 것이 바로 `Geometry Collection`이다.

### 3.2 Fracture 편집은 "어떻게 깨질지"를 미리 설계하는 과정이다

Fracture 모드에서 하는 일은 요약하면 다음과 같다.

- 기존 스태틱 메시를 기반으로 새 `Geometry Collection` 에셋 생성
- 조각 분할 방식 결정
- 내부 단면 머티리얼 설정
- 파괴 레벨과 임계값 설정

즉 이 과정은 런타임 C++보다 앞선 준비 작업이다.
게임 코드가 아무리 잘 돼 있어도, 부서질 에셋이 제대로 만들어져 있지 않으면 원하는 파괴 표현은 나오지 않는다.

![에디터에서 Geometry Collection 자산과 디테일 패널을 함께 확인하는 장면](./assets/images/geometry-collection-asset-details.jpg)

### 3.3 `Damage Threshold`와 `Collision Damage`는 파괴 감각을 좌우한다

자막에서 강조하는 중요한 포인트는 `Damage Threshold`다.
값이 너무 낮으면 스스로 무게만으로도 우수수 깨질 수 있고, 너무 높으면 맞아도 거의 반응하지 않는다.

즉 Geometry Collection은 "보이는 조각 개수"만이 아니라, 언제 깨질지까지 같이 조절해야 한다.
또 `Collision` 쪽 데미지 관련 옵션을 켜야 실제 충돌 기반 파괴가 일어나는 경우가 많다는 점도 같이 짚는다.

이걸 초보자용으로 정리하면 다음과 같다.

- Fracture: 어떤 모양으로 나눌 것인가
- Threshold: 얼마나 강한 힘을 받아야 깨질 것인가
- Collision Damage: 충돌이 실제 파괴 계산에 들어갈 것인가

### 3.4 이번 강의에서 Geometry Collection을 붙이는 이유는 "위치 기반 스킬의 결과물"이 필요하기 때문이다

왜 하필 마법진 지정형 스킬 뒤에 Geometry Collection이 나오는가도 중요하다.
이번 Shinbi 스킬은 단순 데미지 판정보다, 월드 특정 위치에 무언가가 떨어지고 파괴되는 연출을 보여 주려는 목적이 있다.

즉 파이프라인이 이렇게 이어진다.

- 플레이어가 위치를 지정한다.
- 그 위치가 데칼로 보인다.
- 실제 스킬 액터가 그 위치를 향해 떨어진다.
- 도착 지점에서 파괴 반응이 일어난다.

Geometry Collection은 바로 이 마지막 한 단계를 담당한다.

![Shinbi 스킬 충돌 뒤 런타임에서 파괴 결과가 보이는 장면](./assets/images/geometry-collection-runtime-destruction.jpg)

### 3.5 장 정리

제3장의 결론은 Geometry Collection이 "깨지는 메시"라는 단순 표현보다 더 넓은 개념이라는 점이다.
지정형 스킬의 결과를 플레이어가 납득할 수 있는 물리 기반 파괴 반응으로 바꾸는 데이터 구조다.

---

## 제4장. GeometryCollection C++: 파괴용 액터를 코드로 어떻게 붙일 것인가

### 4.1 모듈 의존성부터 맞춰야 Geometry Collection이 보인다

네 번째 강의는 C++에서 Geometry Collection을 다룬다.
이때 가장 먼저 부딪히는 부분이 헤더 include만이 아니라 모듈 의존성이다.
현재 `UE20252.Build.cs`는 이미 필요한 모듈을 넣어 두고 있다.

```csharp
PublicDependencyModuleNames.AddRange(new string[] {
    "Core",
    "CoreUObject",
    "Engine",
    "InputCore",
    "EnhancedInput",
    "GeometryCollectionEngine",
    "Chaos",
    "FieldSystemEngine",
    "AIModule",
    "NavigationSystem",
    "GameplayCameras",
    "GameplayTags",
    "GameplayTasks",
    "GameplayAbilities"
});
```

여기서 이번 날짜와 직접 연결되는 것은 세 모듈이다.

- `GeometryCollectionEngine`
- `Chaos`
- `FieldSystemEngine`

즉 파괴 시스템은 헤더 한 줄이 아니라, 모듈 레벨 의존성까지 맞춰야 컴파일과 런타임이 안정된다.

### 4.2 `AGeometryActor`는 파괴 가능한 스킬 결과물을 담는 액터다

현재 `AGeometryActor` 헤더는 아주 직설적이다.

```cpp
UCLASS()
class UE20252_API AGeometryActor : public AActor
{
    GENERATED_BODY()

protected:
    // 실제 파괴 가능한 조각 데이터를 들고 있는 핵심 컴포넌트
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, meta = (AllowPrivateAccess = "true"))
    TObjectPtr<UGeometryCollectionComponent> mGeometry;

public:
    // 문자열 경로로 Geometry Collection 자산을 연결하는 함수
    void SetGeometryAsset(const FString& Path);

protected:
    // 충돌 시 strain을 가해 실제 파괴를 열어 주는 함수
    UFUNCTION()
    void GeometryHit(UPrimitiveComponent* HitComponent, AActor* OtherActor,
        UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit);
};
```

즉 이 액터는 구조적으로 매우 단순하다.
핵심 컴포넌트 하나와, 자산 로딩 함수 하나, 충돌 반응 함수 하나만 갖는다.
학습용 예제로서 아주 좋은 구성이다.

### 4.3 `SetRestCollection()`이 실제 파괴용 에셋을 연결한다

cpp 구현은 다음처럼 이어진다.

```cpp
AGeometryActor::AGeometryActor()
{
    // 예제 단순화를 위해 Tick을 열어 둔다.
    PrimaryActorTick.bCanEverTick = true;

    // 파괴 가능한 컬렉션 컴포넌트를 만들고 루트로 둔다.
    mGeometry = CreateDefaultSubobject<UGeometryCollectionComponent>(TEXT("Geometry"));
    SetRootComponent(mGeometry);
}

void AGeometryActor::SetGeometryAsset(const FString& Path)
{
    // 경로 문자열로 Geometry Collection 자산을 읽어 온다.
    TObjectPtr<UGeometryCollection> Geometry =
        LoadObject<UGeometryCollection>(nullptr, Path);

    // 읽어 온 자산을 이 액터의 파괴 본체로 연결한다.
    mGeometry->SetRestCollection(Geometry);
}
```

![`SetGeometryAsset()`에서 `UGeometryCollection`을 로드해 연결하는 장면](./assets/images/geometryactor-set-geometry-asset-code.jpg)

여기서 중요한 점은 스태틱 메시 컴포넌트처럼 `SetStaticMesh()`를 쓰는 것이 아니라, `UGeometryCollection` 자산을 `SetRestCollection()`으로 넘긴다는 것이다.
즉 이 액터의 본질은 "깨질 수 있는 컬렉션"을 들고 있다는 데 있다.

### 4.4 `OnComponentHit`와 `ApplyExternalStrain()`이 실제 파괴를 연다

런타임 파괴의 핵심은 `GeometryHit()`이다.

```cpp
void AGeometryActor::BeginPlay()
{
    Super::BeginPlay();
    // 충돌이 나면 GeometryHit으로 들어오게 연결한다.
    mGeometry->OnComponentHit.AddDynamic(this, &AGeometryActor::GeometryHit);
}

void AGeometryActor::GeometryHit(
    UPrimitiveComponent* HitComponent,
    AActor* OtherActor,
    UPrimitiveComponent* OtherComp,
    FVector NormalImpulse,
    const FHitResult& Hit)
{
    // 기본은 첫 조각으로 두고
    int32 ItemIndex = 0;

    // 실제로 맞은 조각 인덱스가 있다면 그 값을 사용한다.
    if (Hit.Item != -1)
    {
        ItemIndex = Hit.Item;
    }

    // 맞은 위치와 힘을 기준으로 외부 strain을 가해 파괴를 유도한다.
    mGeometry->ApplyExternalStrain(
        ItemIndex,
        Hit.ImpactPoint,
        50.f,
        1,
        1.f,
        1500000.f);
}
```

이 함수가 보여 주는 핵심은 네 가지다.

1. `Hit.Item`으로 어떤 조각 인덱스가 맞았는지 읽을 수 있다.
2. `Hit.ImpactPoint`로 어느 위치에 충격을 넣을지 정할 수 있다.
3. `ApplyExternalStrain()`은 단순 충돌 이벤트를 실제 파괴 계산으로 바꾸는 함수다.
4. 반경, 레벨 깊이, 전파 비율, 힘 크기 같은 파라미터로 파괴 감각을 조절할 수 있다.

즉 Geometry Collection의 런타임 파괴는 결국 "어느 조각에, 어느 위치에서, 얼마나 큰 힘을 넣을 것인가"의 문제다.

![블루프린트에서 `ApplyExternalStrain` 노드를 연결해 파괴를 여는 장면](./assets/images/geometryactor-apply-external-strain-blueprint.jpg)

### 4.5 현재 Shinbi 스킬과 `AGeometryActor`는 꽤 자연스럽게 연결된다

`Shinbi::InputAttack()`에서 마법진 위치 위 1000 유닛 상공에 `AGeometryActor`를 생성하는 이유도 이제 이해할 수 있다.
그 액터가 아래로 떨어지고, 바닥이나 다른 대상과 부딪히면 `OnComponentHit`가 발생하고, 그 순간 `ApplyExternalStrain()`이 파괴를 연다.

즉 지정형 스킬의 최종 구조는 다음처럼 읽는다.

`Pick 위치 결정 -> 마법진으로 표시 -> 상공에 파괴 액터 스폰 -> 충돌 -> strain 적용 -> 파괴`

### 4.6 장 정리

제4장의 결론은 Geometry Collection C++ 연동이 단순 컴포넌트 추가가 아니라는 점이다.
모듈 의존성, 자산 로딩, 충돌 이벤트, strain 적용까지 한 세트가 맞아야 비로소 월드 안에서 부서지는 스킬 연출이 성립한다.

---

## 제5장. 현재 프로젝트 C++로 다시 읽는 260413 핵심 구조

### 5.1 이번 날짜의 진짜 성과는 위치 기반 스킬의 전체 파이프라인을 붙였다는 점이다

현재 소스 기준으로 `260413`의 핵심은 한 기능이 아니라 파이프라인이다.

1. 컨트롤러가 마우스 커서를 보이고 월드 위치를 읽는다.
2. Shinbi가 그 위치에 마법진 데칼을 생성한다.
3. Tick이 마법진을 커서 위치로 계속 갱신한다.
4. 공격 입력이 오면 그 좌표 기준으로 스킬 액터를 생성한다.
5. 스킬 액터가 충돌하면서 Geometry Collection 파괴를 일으킨다.

즉 이번 날짜는 "클릭해서 스킬 쏘기"가 아니라, 목표 지정부터 파괴 반응까지 이어지는 완전한 지정형 스킬 골격을 세운 날이다.

### 5.2 현재 파이프라인은 아래 한 줄로 요약된다

`AMainPlayerController::GetHitResultUnderCursor() -> AShinbi::Skill1Casting() -> mMagicCircleActor -> AShinbi::InputAttack() -> AGeometryActor::SetGeometryAsset() -> GeometryHit() -> ApplyExternalStrain()`

이렇게 읽어 두면 이후 다른 스킬을 만들 때도 응용이 쉽다.

- 목표 지정 방식만 바꾸면 다른 범위 스킬이 된다.
- 생성 액터만 바꾸면 메테오, 폭발, 덫, 얼음 장판 같은 다른 스킬로 바뀐다.
- 파괴 액터 대신 파티클/데미지 볼륨을 넣으면 또 다른 장르의 기술이 된다.

### 5.3 현재 코드의 남은 과제도 분명하다

학습용 구조로는 충분히 좋지만, 아직 남아 있는 확장 포인트도 뚜렷하다.

- 평타/스킬 캔슬 규칙 정교화
- 스킬 사거리 제한
- 범위 밖 클릭 처리
- 마법진 크기와 실제 판정 범위 일치
- 파괴 뒤 데미지 판정이나 이펙트 추가

즉 이번 날짜는 지정형 스킬의 "뼈대"를 완성한 날이고, 그 위에 세부 게임 규칙을 덧붙일 준비가 된 상태다.

### 5.4 장 정리

현재 C++ 기준으로 `260413`은 아래 문장으로 가장 잘 요약된다.

`마우스로 월드 위치를 고르고, 그곳을 데칼로 먼저 보여 준 뒤, 실제 파괴 가능한 액터를 떨어뜨려 Geometry Collection 반응으로 마무리하는 날`

---

## 전체 정리

`260413`은 플레이어 공격을 "캐릭터 앞쪽에서만 발생하는 행동"에서 "플레이어가 월드 특정 위치를 지정해 발동하는 행동"으로 확장하는 날이다.
`AMainPlayerController`는 마우스 커서와 Picking 기반을 마련하고, `AShinbi`는 그 결과를 마법진 데칼과 발사 분기로 묶고, `AGeometryActor`는 최종 결과를 Geometry Collection 파괴 연출로 바꾼다.

즉 이 날짜의 진짜 성과는 기술 하나를 만드는 것이 아니라, 위치 기반 스킬이 가져야 할 네 단계를 모두 연결했다는 데 있다.

- `Pick`: 어디를 목표로 할지 고른다
- `Preview`: 그 지점을 데칼로 보여 준다
- `Spawn`: 실제 스킬 액터를 생성한다
- `React`: 파괴나 충돌 반응을 발생시킨다

이 구조를 이해하면 이후 다른 지정형 스킬을 추가하는 일도 훨씬 쉬워진다.

## 복습 체크리스트

- `bShowMouseCursor`와 `FInputModeGameAndUI`가 왜 먼저 필요한지 설명할 수 있는가
- `GetHitResultUnderCursor()`가 단순 좌표 반환이 아니라 충돌 기반 월드 위치 반환이라는 점을 설명할 수 있는가
- `Skill1Casting()`이 마법진을 생성할 때 `Hit.ImpactPoint`와 회전값을 어떻게 쓰는지 설명할 수 있는가
- `Tick()`에서 마법진 위치를 갱신하는 이유를 설명할 수 있는가
- `InputAttack()`이 `mMagicCircleActor` 유효성으로 평타와 스킬을 분기하는 이유를 말할 수 있는가
- `Geometry Collection`과 일반 스태틱 메시의 차이를 설명할 수 있는가
- `Damage Threshold`가 너무 낮거나 높을 때 어떤 현상이 생기는지 설명할 수 있는가
- `UE20252.Build.cs`에 왜 `GeometryCollectionEngine`, `Chaos`, `FieldSystemEngine`이 필요한지 말할 수 있는가
- `ApplyExternalStrain()`의 주요 파라미터가 무엇을 의미하는지 설명할 수 있는가
- 이번 날짜 파이프라인이 `Pick -> Preview -> Spawn -> React` 구조라는 점을 설명할 수 있는가

## 세미나 질문

1. 지정형 스킬을 만들 때 마우스 위치를 매 프레임 추적하는 방식과, 클릭 순간에만 한 번 읽는 방식은 어떤 UX 차이를 만들까?
2. 마법진 데칼을 단순 시각 효과가 아니라 상태 플래그로도 사용하는 현재 구조의 장단점은 무엇일까?
3. Geometry Collection 파괴를 직접 힘으로 여는 방식과, 충돌 데미지 설정에만 기대는 방식은 어떤 차이가 있을까?
4. `GetHitResultUnderCursor()`가 캐릭터가 아닌 컨트롤러 계층에서 먼저 준비되는 설계는 장기적으로 어떤 이점을 줄까?
5. 메테오, 폭발, 얼음 장판, 힐 존처럼 서로 다른 지정형 스킬을 만든다고 했을 때, 현재 구조에서 어떤 부분을 공통화하고 어떤 부분을 스킬별로 갈라야 할까?

## 권장 과제

1. Shinbi 스킬에 최대 사거리 제한을 넣는다고 가정하고, `Hit.ImpactPoint`와 플레이어 위치를 비교해 어느 단계에서 컷하는 게 좋은지 설계해 본다.
2. 마법진 데칼의 크기와 실제 판정 범위를 일치시키기 위해, 이미지 리소스와 데칼 박스 크기 중 어디를 먼저 조정하는 게 좋은지 비교해 본다.
3. `AGeometryActor` 대신 파티클과 데미지 볼륨만 가진 `MeteorSkillActor`를 만든다고 가정하고, 공통 베이스 액터를 어떻게 설계할지 적어 본다.
4. `ApplyExternalStrain()`의 반경, 전파 깊이, 전파 비율, 힘 크기를 바꿔 가며 어떤 파괴 감각 차이가 생길지 예상 표를 작성해 본다.
5. `MainPlayerController.cpp`, `Shinbi.cpp`, `GeometryActor.cpp`, `UE20252.Build.cs`를 기준으로 "마우스 지정형 스킬" 시퀀스 다이어그램을 그려 본다.
