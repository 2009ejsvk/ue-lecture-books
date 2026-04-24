# UE Lecture Books

Markdown 기반 언리얼 강의 교재 저장소입니다.

## 교재

- [260401. 언리얼 프로젝트를 처음 만들고 에디터 화면, 클래스 구조, 블루프린트 기초를 익히는 입문](./260401/)
- [260402. 플레이어를 움직이고 카메라를 붙이고 공격 입력으로 총알을 생성하는 블루프린트 기초](./260402/)
- [260403. 충돌 판정, 태그, 타이머, 트리거 박스로 상호작용과 함정을 만드는 기초](./260403/)
- [260406. 플레이어를 C++ 클래스로 옮기고 GameMode와 입력 자산을 연결하는 기초](./260406/)
- [260407. 이동 속도와 시선 값을 애니메이션으로 연결해 자연스러운 플레이어 움직임을 만드는 기초](./260407/)
- [260408. 공격 몽타주, 슬롯, 노티파이, 콤보 섹션으로 전투 애니메이션을 조립하는 구조](./260408/)
- [260409. 공격 판정, 데미지, 이펙트, 사운드, 투사체를 묶어 플레이어 전투를 완성하는 기초](./260409/)
- [260410. Wraith 투사체, 데칼, Shinbi 스킬 캐스팅 모션으로 공격 표현을 확장하는 날](./260410/)
- [260413. Mouse Picking, 마법진 지정형 스킬, Geometry Collection으로 위치 기반 파괴 연출을 만드는 날](./260413/)
- [260414. 몬스터 본체, 감지, 비헤이비어 트리, 블랙보드, 데이터 관리까지 AI 기반을 세우는 날](./260414/)
- [260415. 몬스터를 스폰하고 순찰시키고 플레이어를 감지하면 추적으로 바꾸는 AI 기초](./260415/)
- [260416. 추적에서 공격으로 넘어가고 노티파이 시점에 타격하는 몬스터 전투 AI 루프](./260416/)
- [260417. 비전투 대기와 순찰을 반복하는 AI를 만들고 순찰 버그를 디버깅하는 날](./260417/)
- [260420. 몬스터가 죽은 뒤 랙돌로 쓰러지고 아이템 박스를 떨어뜨린 뒤 획득까지 이어지는 마무리](./260420/)
- [260421. GASDocumentation 예제와 Epic 공식 문서를 함께 읽으며 Gameplay Ability System을 초급, 중급, 고급으로 나눠 배우는 분권형 교재](./260421/)
  - [01. GAS란 무엇인가](./260421/01_beginner_gas_overview/)
  - [02. Jump Ability로 보는 GAS 생명주기](./260421/02_beginner_jump_ability/)
  - [03. AttributeSet과 GameplayEffect 후처리](./260421/03_intermediate_attributes_and_effects/)
  - [04. 초기화와 Ability 지급](./260421/04_intermediate_initialization_and_granting/)
  - [05. FireGun과 데미지 파이프라인](./260421/05_advanced_firegun_and_damage_pipeline/)
  - [06. PlayerState, Owner/Avatar, 멀티플레이 구조](./260421/06_advanced_playerstate_and_multiplayer/)
  - [07. GAS 함수 치트시트와 추천 파일 순서](./260421/07_appendix_cheatsheet/)
  - [08. 언리얼 공식 문서 참고 가이드](./260421/08_appendix_official_docs_reference/)
- [260422. UE20252 실전 프로젝트에 GameplayEffect와 ManaCost 파이프라인을 실제로 붙이며 GAS를 체감하는 보충 교재](./260422/)
  - [01. 이벤트 공격이 Ability로 들어오는 흐름](./260422/01_beginner_event_to_asc_and_attribute/)
  - [02. ManaCost GameplayEffect와 SetByCaller](./260422/02_intermediate_manacost_effect_and_setbycaller/)
  - [03. Spec 적용과 PostGameplayEffectExecute](./260422/03_intermediate_spec_apply_and_post_execute/)
  - [04. TargetData와 다음 데미지 이펙트 예고](./260422/04_advanced_targetdata_and_damage_preview/)
  - [05. Damage GameplayEffect와 GameplayCue로 실제 피해를 적용하는 흐름](./260422/05_advanced_damage_effect_and_gameplaycue/)
- [260423. UE20252 실전 프로젝트에서 GAS 공격 완성, GameplayCue 적용, MonsterGAS 전투 연결까지 이어지는 보충 교재](./260423/)
  - [01. GAS 공격 파이프라인 완성](./260423/01_intermediate_gas_attack_completion/)
  - [02. GameplayCue 적용과 타격 연출 분리](./260423/02_intermediate_gameplaycue_application/)
  - [03. MonsterGAS에 공격 파이프라인 적용](./260423/03_advanced_monster_attack_gas_application/)
- [260424. UE20252 실전 프로젝트에서 MonsterGAS 사망 처리, 커스텀 ASC 설계, AbilityTask 전환, AcademyUtility 부록까지 이어지는 보충 교재](./260424/)
  - [01. MonsterGAS 죽음 처리와 AttributeSet 콜백 설계](./260424/01_intermediate_monster_death_gas_application/)
  - [02. 커스텀 AbilitySystemComponent와 ManaCost 구조 정리](./260424/02_intermediate_custom_abilitysystemcomponent_and_mana_cost/)
  - [03. AbilityTask와 몽타주 재생 책임 옮기기](./260424/03_advanced_abilitytask_and_montage_ability_playback/)
  - [04. AcademyUtility 덤프 워크플로 부록](./260424/04_appendix_academyutility_dump_workflow/)

## 최근 개정 포인트

- `260414`: 기존 `MonsterState` 축 설명에 현재 `MonsterGAS`, `MonsterGASController`, `AttributeSet` 비교 메모를 붙여, AI 기반 구조가 최신 branch에서 어떻게 이어지는지 같이 읽을 수 있게 했다.
- `260415`: 스폰과 순찰 설명을 `MonsterBase` 원형만이 아니라 `MonsterGAS`, `MonsterGASController`, `BT_MonsterGAS_Normal`, `BTTask_PatrolGAS`, `BTTask_TraceGAS` 기준으로 다시 정리했다.
- `260416`: 기존 `NormalAttack -> TakeDamage` 루프와 현재 `Ability.Attack -> GameplayEffect_Damage -> GameplayCue.Battle.Attack` 루프를 비교 보강했고, `Gunner`는 아직 GAS 이관이 덜 된 점도 메모했다.
- `260420`: 사망 후반 파이프라인이 현재 `MonsterGAS::Death()`와 `EndPlay()`에서도 거의 그대로 재사용된다는 점과, `TakeDamage()` 진입점은 아직 완전히 GAS화되지 않은 점을 반영했다.
- `260422`: `Damage GameplayEffect`와 `GameplayCue`까지 이어지는 5편을 추가해 실전 GAS 흐름이 `ApplyGameplayEffectSpecToTarget`까지 닫히도록 확장했다.
- `260423`: `GAS 공격 완성`, `GameplayCue 적용`, `MonsterGAS 공격 연결` 3편을 새로 추가해 플레이어 공격 GAS가 연출과 몬스터 AI 전투까지 이어지는 구조를 정리했다.
- `260424`: `MonsterGAS` 사망 처리 진입점, 커스텀 `AbilitySystemComponent` 설계, `AbilityTask`와 몽타주 전환 방향, `AcademyUtility` 부록까지 4편 구조로 새로 정리했다.

## 초보자용 찾아보기

- `260401`: 언리얼을 처음 켜서 프로젝트를 만들고, 에디터 화면과 블루프린트 기초 개념부터 잡고 싶을 때
- `260402`: 캐릭터를 움직이고 카메라를 붙이고 공격 버튼으로 총알을 발사하는 흐름을 만들고 싶을 때
- `260403`: 충돌, 태그, 타이머, 트리거를 이용해 맞으면 반응하는 오브젝트나 함정을 만들고 싶을 때
- `260406`: 블루프린트 플레이어를 C++ 클래스로 옮기고 입력 시스템을 구조적으로 정리하고 싶을 때
- `260407`: 움직임과 시선 값을 애니메이션에 연결해서 캐릭터가 자연스럽게 걷고 뛰고 점프하게 만들고 싶을 때
- `260408`: 공격 몽타주, 노티파이, 콤보 섹션으로 전투 애니메이션 구조를 만들고 싶을 때
- `260409`: 실제 공격 판정, 데미지, 이펙트, 사운드, 투사체까지 붙여 전투를 완성하고 싶을 때
- `260410`: Wraith 총알 발사 위치, 데칼 자국, Shinbi 스킬 캐스팅 모션처럼 공격 표현을 한 단계 더 풍부하게 만들고 싶을 때
- `260413`: 마우스로 월드 지점을 찍고, 마법진을 띄우고, 그 위치에 파괴 연출까지 연결되는 지정형 스킬을 만들고 싶을 때
- `260414`: 몬스터 AI를 만들기 전에 감지, 판단, 데이터 관리까지 포함한 기반 구조를 잡고, 그 구조가 현재 branch에서 `ASC + AttributeSet`으로 어떻게 옮겨 갔는지도 같이 보고 싶을 때
- `260415`: 몬스터를 맵에 배치하고 순찰시키고 플레이어를 보면 추적하게 만들되, 현재 `MonsterGAS`와 `BT_MonsterGAS_Normal` 기준 배치도 같이 보고 싶을 때
- `260416`: 몬스터가 추적에서 공격으로 넘어가고 노티파이 타이밍에 맞춰 때리게 만들면서, legacy 직통 데미지와 GAS 데미지 루프 차이도 같이 보고 싶을 때
- `260417`: 몬스터가 전투 중이 아닐 때 대기하고 순찰하는 루프를 만들고, 순찰이 꼬일 때 원인을 찾고 싶을 때
- `260420`: 몬스터가 죽은 뒤 랙돌로 쓰러지고 아이템을 떨어뜨리고 플레이어가 주워 가는 마무리 루프를 만들고, 그 후반 파이프라인이 현재 `MonsterGAS`에도 어떻게 이어지는지 추적하고 싶을 때
- `260421`: GAS를 처음 배울 때 `초급 -> 중급 -> 고급` 순서로 쪼개진 분권형 교재와 Epic 공식 문서 연결을 같이 보고 싶을 때
- `260422`: GAS 개념을 배운 뒤, 실제 `UE20252` 프로젝트에서 `GameplayEffect`, `SetByCaller`, `ApplyGameplayEffectSpecToSelf`, `ApplyGameplayEffectSpecToTarget`, `GameplayCue`가 어디에 들어가는지 실전 코드로 보고 싶을 때
- `260423`: `GameplayAbility_Attack`이 실제로 어떻게 완성되는지, `GameplayCue.Battle.Attack`이 연출을 어떻게 분리하는지, 그리고 그 공격 루프가 `MonsterGAS`와 `BTTask_AttackGAS`까지 어떻게 이어지는지 같이 보고 싶을 때
- `260424`: `MonsterGAS` 사망 처리 진입점, `GameplayAbility_Base`의 `ManaCost`/`CoolDown` 구조, `AbilityTask` 전환 방향, `AcademyUtility` 덤프 워크플로까지 한 날짜에서 같이 보고 싶을 때

## 원칙

- HTML 대시보드 형식 제거
- PPT 형식 제거
- Markdown 문서 중심 구성
- 날짜별 폴더에는 `index.md`와 `assets`만 유지

## 현재 구조

- `index.md`: 루트 서가
- `260401/index.md`: 2026-04-01 교재
- `260402/index.md`: 2026-04-02 교재
- `260403/index.md`: 2026-04-03 교재
- `260406/index.md`: 2026-04-06 교재
- `260407/index.md`: 2026-04-07 교재
- `260408/index.md`: 2026-04-08 교재
- `260409/index.md`: 2026-04-09 교재
- `260410/index.md`: 2026-04-10 교재
- `260413/index.md`: 2026-04-13 교재
- `260414/index.md`: 2026-04-14 교재
- `260415/index.md`: 2026-04-15 교재
- `260416/index.md`: 2026-04-16 교재
- `260417/index.md`: 2026-04-17 교재
- `260420/index.md`: 2026-04-20 교재
- `260421/index.md`: 2026-04-21 GASDocumentation 기반 GAS 입문 교재
- `260422/index.md`: 2026-04-22 UE20252 실전 GameplayEffect 및 Damage/Cue 보충 교재
- `260423/index.md`: 2026-04-23 UE20252 실전 GAS 공격 완성, GameplayCue, MonsterGAS 연결 보충 교재
- `260424/index.md`: 2026-04-24 MonsterGAS 사망 처리, 커스텀 ASC, AbilityTask, AcademyUtility 부록 교재
- `260401/assets/images`, `260402/assets/images`, `260403/assets/images`, `260406/assets/images`, `260407/assets/images`, `260408/assets/images`, `260409/assets/images`, `260410/assets/images`, `260413/assets/images`, `260414/assets/images`, `260415/assets/images`, `260416/assets/images`, `260417/assets/images`, `260420/assets/images`: 원본 영상에서 다시 추출한 캡처
- `260421/assets/images`: GAS 입문 교재용 이미지 자리
- `260422/assets/images`: UE20252 실전 GameplayEffect 교재용 이미지 자리
- `260423/assets/images`: UE20252 실전 GAS 공격 완성, GameplayCue, MonsterGAS 교재용 이미지 자리
- `260424/assets/images`: 260424 교재용 이미지 자리
