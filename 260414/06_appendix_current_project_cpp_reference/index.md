---
title: 260414 06 현재 프로젝트 C++ 부록
---

# 260414 06 현재 프로젝트 C++ 부록

[260414 허브](../) | [이전: 05 공식 문서 부록](../05_appendix_official_docs_reference/)

## 문서 개요

`260414`는 한 클래스만 보면 이해가 끝나지 않는 날짜다.
실제 구조는 `MonsterBase`, `MonsterController`, `MonsterNormal`, `AssetGameInstanceSubsystem`, `MonsterGAS`까지 여러 클래스가 나눠 맡는다.

## 1. legacy 기준 핵심 흐름

현재 프로젝트의 legacy 몬스터 축을 한 줄로 정리하면 아래와 같다.

`AMonsterBase 생성 -> BeginPlay()에서 데이터 조회 -> 없으면 비동기 로드 대기 -> MonsterInfoLoadComplete()에서 능력치 주입 -> AMonsterController::OnTarget()에서 Target 갱신 -> AMonsterNormal::PossessedBy()에서 BT 실행`

즉 `260414`는 공격 함수 하나보다 `몸체`, `감지`, `데이터 공급`, `BT 실행`이 어떻게 연결되는가를 읽는 날이다.

## 2. `AMonsterBase`가 몸체와 데이터 진입점을 동시에 만든다

`AMonsterBase`는 아래 네 가지를 한 번에 담당한다.

- `mBody`, `mMesh`, `mMovement`로 몬스터 본체 조립
- `AIControllerClass`, `AutoPossessAI`로 AI 빙의 전제 설정
- `IGenericTeamAgentInterface`로 팀 판정 기반 제공
- `mDataName`으로 어떤 데이터 테이블 행을 읽을지 연결

그래서 이 클래스는 단순 부모 클래스가 아니라, `몸체 + 팀 + 데이터 진입점`을 한 번에 잡는 공통 베이스다.

## 3. `BeginPlay()`와 `MonsterInfoLoadComplete()`가 실제 수치 주입을 맡는다

`BeginPlay()`는 게임이 시작됐을 때 몬스터가 바로 데이터를 받을 수 있는지 확인한다.
없으면 델리게이트에 자신을 등록해 두고, 준비가 되면 `MonsterInfoLoadComplete()`를 통해 수치를 주입받는다.

```cpp
const FMonsterInfo* Info = AssetSubSystem->FindMonsterInfo(mDataName);

if (!Info)
{
    AssetSubSystem->mMonsterInfoLoadDelegate.AddUObject(
        this, &AMonsterBase::MonsterInfoLoadComplete);
    return;
}

MonsterInfoLoadComplete();
```

그리고 실제 주입 시점에는 `Attack`, `Defense`, `HP`, `WalkSpeed`, `RunSpeed`, `DetectRange`, `AttackDistance`가 런타임 상태로 복사되고, 이동 속도와 AI 감지 반경에도 바로 반영된다.

즉 `DT_MonsterInfo`는 표로 끝나는 게 아니라, `MonsterInfoLoadComplete()`를 거치며 실제 몬스터 상태로 바뀐다.

## 4. `AMonsterController`와 `AMonsterNormal`이 AI 실행을 마무리한다

`AMonsterController`는 감각과 블랙보드 갱신을 맡고, `AMonsterNormal`은 빙의 순간 어떤 비헤이비어 트리를 실행할지 정한다.

```cpp
void AMonsterNormal::PossessedBy(AController* NewController)
{
    AMonsterController* Ctrl = Cast<AMonsterController>(NewController);
    Ctrl->SetAITree(TEXT("/Game/Monster/BT_Monster_Normal.BT_Monster_Normal"));
    Super::PossessedBy(NewController);
}
```

즉 현재 프로젝트에서 `Behavior Tree`는 에디터 자산으로만 존재하는 게 아니라, `PossessedBy()` 시점에 실제 런타임 객체로 연결된다.

## 5. `UAssetGameInstanceSubsystem`이 데이터 공급을 중앙화한다

이 날짜의 또 다른 핵심은 모든 몬스터가 제각기 데이터 테이블을 찾으러 다니지 않는다는 점이다.
`UAssetGameInstanceSubsystem`이 시작 시점에 `PDA_MonsterInfo`를 로드하고, 그 안의 `mTable`을 실제 `UDataTable`로 바꿔 잡는다.

그 결과 각 몬스터는 `mDataName`만 알고 있어도 `FindMonsterInfo()`로 자기 능력치를 받아 갈 수 있다.

## 6. 현재 branch는 이 구조 위에 GAS를 얹었다

지금 저장소에선 같은 구조가 `AMonsterGAS` 축으로 확장돼 있다.

- `AMonsterGAS`: 여전히 `Pawn` 기반 본체를 직접 조립한다
- `AMonsterGASController`: `Perception -> Blackboard Target 갱신` 구조를 그대로 유지한다
- `AMonsterGAS::BeginPlay()`: `mASC->InitAbilityActorInfo(this, this)`와 `GiveAbility()`를 추가한다
- `AMonsterGAS::MonsterInfoLoadComplete()`: `FMonsterInfo`를 멤버 변수 대신 `UMonsterAttributeSet`에 복사한다

즉 `260414`가 만든 기반은 현재 branch에서 없어지지 않았다.
오히려 `DataTable -> AttributeSet -> AI/Movement -> GameplayAbility`로 이어지는 더 큰 파이프라인의 앞단이 됐다.

## 정리

현재 프로젝트 C++ 기준으로 다시 보면 `260414`의 요점은 아래다.

1. `AMonsterBase`가 몬스터 본체와 데이터 진입점을 만든다.
2. `UAssetGameInstanceSubsystem`이 몬스터 데이터를 중앙에서 공급한다.
3. `MonsterInfoLoadComplete()`가 그 데이터를 실제 런타임 상태로 바꾼다.
4. `AMonsterController::OnTarget()`이 감지를 블랙보드와 몬스터 반응으로 번역한다.
5. `AMonsterNormal::PossessedBy()`가 BT 실행을 마무리한다.
6. 현재 branch에서는 이 구조가 `AMonsterGAS`, `AMonsterGASController`, `UMonsterAttributeSet`으로 확장돼 이후 GAS 전투 루프의 기반이 된다.

[260414 허브](../) | [이전: 05 공식 문서 부록](../05_appendix_official_docs_reference/)
