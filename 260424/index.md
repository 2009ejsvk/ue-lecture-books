---
title: 260424 AcademyUtility로 덤프를 모아 교재를 보강하는 부록
---

# 260424 AcademyUtility로 덤프를 모아 교재를 보강하는 부록

## 문서 개요

이 문서는 `UE_Academy_Stduy` 프로젝트에 넣어 둔 `AcademyUtilityPlugin`을 기준으로,
강의 교재를 보강할 때 필요한 자료를 어떻게 빠르게 수집하는지 정리한 부록이다.

기존 날짜 교재가 `강의 내용 -> 실제 코드/애셋 설명` 쪽에 가까웠다면,
이번 부록은 그 문서를 보강하기 위해 `어떤 명령으로 무엇을 덤프하고, 어떤 파일을 읽으면 되는가`를 정리한다.

핵심 흐름은 아래 한 줄로 요약할 수 있다.

`대상 선택 -> Dump 명령 실행 -> Saved/AcademyUtility 산출물 확인 -> 필요한 파일만 골라 문서에 반영`

## 이 문서를 만드는 데 사용한 자료

- `D:\UnrealProjects\UE_Academy_Stduy\Plugins\AcademyUtilityPlugin\README_KR.txt`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\README_KR_FileDump.txt`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\AcademyUtility_FileDump.txt`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\DumpPath_Summary.txt`

## 왜 이 부록이 필요한가

- `AcademyUtility`는 블루프린트, 네이티브 C++ 클래스, AI 자산, `GameplayTags` 설정, 레벨 배치까지 한 폴더에 모아 준다.
- `Academy.Dump.Path`가 추가되면서 이름 모호성 없이 `/Game/...`, `/Script/...`, 일반 파일 경로를 한 번에 섞어 덤프할 수 있게 됐다.
- `Academy.Generate.Header`, `Academy.Generate.CppDraft`까지 있어서 블루프린트를 읽을 때 구조 초안을 빠르게 얻을 수 있다.
- 즉 이 플러그인은 단순한 "파일 복사기"가 아니라, 교재 집필용 스냅샷 생성 도구에 가깝다.

## 명령 선택 가이드

- `Academy.Dump.Selected`
  지금 에디터에서 선택한 대상 하나를 빨리 확인할 때 가장 편하다.
- `Academy.Dump.List`
  이름 목록을 한 번에 넣어 처리할 때 쓴다. 같은 이름이 여러 개면 모호성 후보가 생길 수 있다.
- `Academy.Dump.Path`
  지금 기준으로 가장 중요한 명령이다. `/Game/...`, `/Script/...`, `C:\...`, `@목록파일.txt`를 섞어 재현 가능하게 덤프할 수 있다.
- `Academy.Dump.GameplayTags`
  `GameplayTag`는 자산 덤프가 아니라 설정 파일 덤프 대상이므로 따로 이 명령을 써야 한다.
- `Academy.Dump.Level`
  레벨 액터 배치 정보가 필요할 때 쓴다. `Academy.Dump.Level All`이면 현재 월드 전체를 본다.
- `Academy.DumpCoreTargets`
  기존 몬스터/플레이어 학습 코어 세트를 한 번에 뽑을 때 편하다.
- `Academy.Generate.Header`
  블루프린트의 선언 위주 C++ 헤더 프리뷰가 필요할 때 쓴다.
- `Academy.Generate.CppDraft`
  블루프린트 그래프를 코드로 옮길 때 시작점 초안이 필요할 때 쓴다.
- `Academy.Generate.All`
  노드 덤프, 헤더 프리뷰, C++ 초안을 한 번에 만들고 싶을 때 쓴다.

## 문서 보강용 추천 워크플로

1. 대상 하나를 먼저 `Academy.Dump.Selected`나 `Academy.Dump.Path`로 확인한다.
2. 챕터 하나를 보강할 정도로 대상이 많아지면 경로 목록 텍스트 파일을 만들고 `Academy.Dump.Path @C:\Users\2009e\Desktop\DumpPaths.txt`처럼 실행한다.
3. `GameplayTag`와 레벨 배치는 일반 자산 덤프와 분리해서 `Academy.Dump.GameplayTags`, `Academy.Dump.Level`로 추가 확보한다.
4. 결과는 `Saved/AcademyUtility`에서 파일 종류별로 읽는다. 코드 흐름은 `SourceDump`, 블루프린트 구조는 `NodeDump`, AI/데이터 자산은 `AssetDump`, 태그는 `GameplayTagsDump`, 맵 배치는 `LevelDump`를 우선 본다.
5. `HeaderPreview`, `CppDraft`는 설명 보조 자료로만 쓰고, 실제 구현 근거는 원본 소스나 노드 덤프와 반드시 다시 맞춘다.

## 바로 쓸 수 있는 예시 명령

```text
Academy.Dump.Selected
Academy.Dump.Path "/Script/UE20252.GameplayAbility_Attack"
Academy.Dump.Path "/Game/Monster/BT_Monster_Normal.BT_Monster_Normal"
Academy.Dump.Path @C:\Users\2009e\Desktop\DumpPaths.txt
Academy.Dump.GameplayTags
Academy.Dump.Level All
Academy.Generate.All
```

## 이번 프로젝트에서 지금 확인한 덤프 상태

현재 `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`에는 총 `387`개 산출물이 있다.

- `DumpPath_Summary.txt` 기준 입력은 `@C:\Users\2009e\Desktop\DumpPaths.txt`
- 요청 경로 수는 `294`
- 결과는 `Dumped=294`, `Missing=0`, `Failed=0`

파일 종류 분포는 아래처럼 정리된다.

- `AssetDump`: 211
- `SourceDump`: 39
- `FileDump`: 30
- `NodeDump`: 20
- `HeaderPreview`: 20
- `CppDraft.h`: 20
- `CppDraft.cpp`: 20
- `LiveWidgetDump`: 20
- `MaterialDump`: 4
- `GameplayTagsDump`: 1
- `LevelDump`: 1
- `Summary`: 1

즉 이번 덤프는 블루프린트, C++ 소스, AI 자산, 일반 파일, 태그, 레벨까지 꽤 넓게 확보된 상태다.

## 어떤 파일을 먼저 읽어야 하는가

- `*_SourceDump.txt`
  네이티브 C++ 클래스 흐름을 볼 때 가장 먼저 읽는다. 예: `GameplayAbility_Attack_SourceDump.txt`, `MonsterSpawnPoint_SourceDump.txt`
- `*_NodeDump.txt`
  블루프린트 실행 흐름, 핀 연결, 변수, 컴포넌트를 볼 때 쓴다.
- `*_AssetDump.txt`
  `BehaviorTree`, `Blackboard`, `DataTable`, `GameplayEffect`, 메시/사운드 같은 자산 기본 구조를 볼 때 쓴다.
- `*_GameplayTagsDump.txt`
  현재 프로젝트에 실제 등록된 태그와 리다이렉트를 볼 때 쓴다. `DefaultGameplayTags_GameplayTagsDump.txt`가 대표 예다.
- `*_LevelDump.txt`
  맵에 무엇이 어디 배치됐는지 볼 때 쓴다. `Main_LevelDump.txt`가 대표 예다.
- `*_HeaderPreview.h`, `*_CppDraft.h`, `*_CppDraft.cpp`
  블루프린트 C++ 전환 감을 잡는 참고 초안이다. 완성 코드로 보면 안 된다.
- `*_FileDump.txt`
  `.ini`, `.txt`, 프로젝트 설정 파일, 일반 소스 파일 원문을 그대로 확인할 때 쓴다.

일부 블루프린트 대상은 `*_LiveWidgetDump.txt` 같은 보조 출력도 함께 생긴다.
이 파일은 이름상 블루프린트 시각 구조 보조 자료로 보이지만, 실제 문서 보강에서는 위 핵심 파일들을 먼저 읽는 편이 훨씬 효율적이다.

## 날짜별 교재와 연결되는 대표 타깃

- `260414`
  `BT_Monster_Normal`, `BB_Monster_Base`, `BB_Monster_Normal`, `DT_MonsterInfo`, `MonsterBase`, `MonsterController`
- `260415`
  `MonsterSpawnPoint`, `BTTask_Patrol`, `BTTask_MonsterTrace`
- `260416`
  `MonsterAnimInstance`, `BTTask_MonsterAttack`, 몬스터 애님 블루프린트
- `260420`
  `ItemBox`, 몬스터 사망 후반 처리 관련 네이티브 클래스와 자산
- `260421`
  `PlayerCharacterGAS`, `ShinbiGAS`, `GameplayAbility_Base`, `GameplayEffect_ManaCost`, `BaseAttributeSet`, `PlayerAttributeSet`, `MainPlayerState`
- `260422`
  `GameplayAbility_Attack`, `DefaultGameplayTags.ini`, `GameplayCue`/`Damage` 관련 추가 덤프

## 지금 덤프에 이미 들어 있는 대표 결과

- `GameplayAbility_Attack_SourceDump.txt`
- `GameplayAbility_Base_SourceDump.txt`
- `BaseAttributeSet_SourceDump.txt`
- `PlayerCharacterGAS_SourceDump.txt`
- `ShinbiGAS_SourceDump.txt`
- `DefaultGameplayTags_GameplayTagsDump.txt`
- `BT_Monster_Normal_AssetDump.txt`
- `MonsterBase_SourceDump.txt`
- `MonsterController_SourceDump.txt`
- `MonsterSpawnPoint_SourceDump.txt`
- `BTTask_MonsterTrace_SourceDump.txt`
- `BTTask_MonsterAttack_SourceDump.txt`
- `Main_LevelDump.txt`
- `AcademyUtility_FileDump.txt`

## 이번 개정에서 추가로 뽑아두면 좋은 경로

현재 `Saved/AcademyUtility`에는 최신 `MonsterGAS` 라인과 `Damage/Cue` 라인의 덤프가 일부 비어 있다.
이번 보강 이후 다음 경로를 `Academy.Dump.Path`로 추가 확보해 두면 이후 문서 작업이 훨씬 쉬워진다.

```text
/Script/UE20252.MonsterGAS
/Script/UE20252.MonsterGASController
/Script/UE20252.MonsterAttributeSet
/Script/UE20252.MonsterNormalGAS
/Script/UE20252.MonsterNormalGAS_Warrior
/Script/UE20252.MonsterNormalGAS_Gunner
/Script/UE20252.BTTask_PatrolGAS
/Script/UE20252.BTTask_TraceGAS
/Script/UE20252.BTTask_AttackGAS
/Script/UE20252.GameplayEffect_Damage
/Script/UE20252.GameplayCueNotify_StaticBase
/Game/Monster/BT_MonsterGAS_Normal.BT_MonsterGAS_Normal
/Game/Monster/ABP_MonsterGAS_MinionWarrior.ABP_MonsterGAS_MinionWarrior
/Game/Monster/ABP_MonsterGAS_MinionGunner.ABP_MonsterGAS_MinionGunner
/Game/Monster/ABP_MonsterGASNormal.ABP_MonsterGASNormal
```

## 주의할 점

- `Academy.Generate.*`는 변환기라기보다 시작점 생성기다. 설명용 초안으로만 써야 한다.
- `Academy.Dump.List`는 이름 모호성이 생길 수 있다. 문서 재현성을 중시하면 `Academy.Dump.Path`가 더 안전하다.
- `GameplayTag` 정보는 자산 덤프가 아니라 설정 덤프다. `Academy.Dump.GameplayTags`를 빼먹으면 태그 문서가 비게 된다.
- 레벨 배치 덤프는 "어디에 무엇이 놓였는가"를 보여 주지만, 액터 내부 로직까지 대신 설명해 주지는 않는다.

## 권장 과제

1. `260415`나 `260422` 한 챕터를 골라 필요한 타깃만 경로 목록으로 정리하고 `Academy.Dump.Path @파일` 방식으로 다시 덤프해 본다.
2. 같은 대상을 `Academy.Dump.List`와 `Academy.Dump.Path`로 각각 뽑아 보고, 어떤 쪽이 문서 재현성에 더 유리한지 비교해 본다.
3. `DefaultGameplayTags_GameplayTagsDump.txt`와 `Main_LevelDump.txt`를 함께 읽고, "코드/자산만으로는 안 보이는 정보"가 무엇인지 따로 메모해 본다.
