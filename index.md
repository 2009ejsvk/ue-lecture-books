---
title: UE Lecture Books
---

# 언리얼 강의 교재 아카이브

이 저장소는 언리얼 엔진 학습 내용을 날짜별 Markdown 교재로 정리한 아카이브입니다.
이제 페이지는 더 이상 대시보드형 HTML이나 슬라이드형 교안이 아니라, GitHub Pages에서 바로 읽을 수 있는 문서형 노트로 구성됩니다.

## 교재 목록

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

- `260414`: `MonsterBase -> MonsterController -> DataTable` 원형 설명에 현재 `MonsterGAS -> MonsterGASController -> AttributeSet` 비교 메모를 붙였다.
- `260415`: `MonsterSpawnPoint`, `PatrolPath`, `Perception` 설명을 `MonsterGAS`, `BT_MonsterGAS_Normal`, `BTTask_PatrolGAS`, `BTTask_TraceGAS` 기준으로 다시 맞췄다.
- `260416`: `AnimNotify`, `BTTask_MonsterAttack` 전투 루프에 더해, 현재 `Ability.Attack -> GameplayEffect_Damage -> GameplayCue` 파이프라인과 `Gunner` 미이관 상태를 같이 정리했다.
- `260420`: `Death()`, `EndPlay()`, `ItemBox` 후반 파이프라인이 현재 `MonsterGAS`에서도 어디까지 이어지는지 추적 메모를 추가했다.
- `260422`: 실전 GAS 보충 교재에 5편을 추가해 `Damage GameplayEffect`와 `GameplayCue`까지 전체 흐름을 닫았다.
- `260423`: 플레이어 공격 GAS를 `GameplayCue`와 `MonsterGAS`까지 확장하는 3편을 추가해 `Ability.Attack -> Damage -> Cue -> Monster AI` 흐름을 한 날짜로 묶었다.
- `260424`: `MonsterGAS` 사망 처리 진입점, 커스텀 `AbilitySystemComponent` 설계, `AbilityTask`와 몽타주 전환 방향, `AcademyUtility` 부록까지 4편 구조로 새로 정리했다.

## 읽는 방식

- 각 교재는 `강의 흐름 -> 장별 해설 -> 코드 발췌 -> 도판 -> 복습` 순서로 정리되어 있습니다.
- 설명은 `D:\UE_Academy_Stduy_compressed`의 강의 영상, 자막, 캡처와 `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 소스를 함께 대조해 작성했습니다.
- 최근 보강된 날짜들은 `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility` 덤프도 함께 대조해, 강의 원형과 최신 branch 차이를 같이 읽을 수 있게 정리했습니다.
- 이후 날짜가 추가되면 같은 형식으로 Markdown 교재를 계속 늘려 갈 수 있습니다.

## 현재 포함된 주제

- `260401`: 새 프로젝트를 만들고 템플릿을 고른 뒤, 언리얼 에디터 각 패널을 읽는 법과 `UObject -> Actor -> Component -> Pawn -> Character` 관계, 블루프린트 이벤트와 변수 기초를 익히는 문서
- `260402`: `Skeletal Mesh`, `Movement Component`, `Spring Arm`, `Camera`를 붙여 플레이어를 움직이고, `IA_Move`, `IA_Attack`, `BPBullet`, `Spawn Actor`로 공격 입력과 발사체 생성을 연결하는 문서
- `260403`: `Block / Overlap / Ignore` 충돌 규칙, `Projectile Stop`, `Actor Tag`, `Timer`, `Trigger Box`, `Level Blueprint`를 이용해 맞았을 때 반응하고, 구분하고, 함정을 작동시키는 기초 문서
- `260406`: `PlayerCharacter`, `Shinbi`, `DefaultGameMode`, `InputData`, `MappingContext`를 중심으로 플레이어를 블루프린트에서 C++ 구조로 옮기고 `Rotation`, `Jump`, `Attack` 입력을 연결하는 문서
- `260407`: `AnimInstance`, `Animation Blueprint`, `Aim Offset`, `GroundLocomotion`, `Blend Space`, 점프 상태 머신을 이용해 플레이어의 이동 속도와 시선 값을 자연스러운 애니메이션으로 바꾸는 문서
- `260408`: `AnimMontage`, `Slot`, `Notify`, `Combo Section`, `PlayerAnimInstance`, `Animation Template`를 이용해 공격 모션, 콤보 입력 타이밍, 전투 애니메이션 재생 구조를 만드는 문서
- `260409`: `PlayerTemplateAnimInstance`, 충돌 채널과 프로파일, `Sweep`, `TakeDamage`, 파티클, 사운드, 투사체를 묶어 실제 공격 판정과 피격 반응이 있는 플레이어 전투 파이프라인을 만드는 문서
- `260410`: `Wraith`, `Muzzle_01`, `ProjectileMovement`, `WraithBullet`, `Decal`, `Layered Blend Per Bone`, `Skill1 Montage`를 이용해 총알 자국과 스킬 캐스팅 모션까지 포함한 공격 표현 구조를 확장하는 문서
- `260413`: `MainPlayerController`, `GetHitResultUnderCursor`, `ADecalBase`, `Shinbi::Skill1Casting`, `Geometry Collection`, `ApplyExternalStrain`, `GeometryActor`를 이용해 마우스 지정형 스킬과 파괴 연출을 연결하는 문서
- `260414`: `MonsterBase`, `AIController`, `AIPerception`, `Behavior Tree`, `Blackboard`, `MonsterState`, `DataTable`, `AssetManager`를 이용해 몬스터 AI의 본체, 감지, 판단, 데이터 관리 기반을 세우고, 같은 구조가 현재 `MonsterGAS`, `MonsterGASController`, `UMonsterAttributeSet` 쪽에서 어떻게 이어지는지도 비교하는 문서
- `260415`: `MonsterSpawnPoint`, `PatrolPath`, `MonsterGAS`, `MonsterGASController`, `BT_MonsterGAS_Normal`, `BTTask_PatrolGAS`, `BTTask_TraceGAS`를 이용해 몬스터가 월드에 생성되고 순찰하다가 플레이어를 보면 추적하도록 만드는 문서
- `260416`: `MonsterAnimInstance`, `MonsterGASAnimInstance`, `BTTask_MonsterTrace`, `BTTask_AttackGAS`, `AnimNotify` 기반 전투 루프를 이용해 추적에서 공격으로 넘어가고, 기존 `TakeDamage` 직통 루프와 현재 GAS 공격 루프 차이까지 맞춰 보는 몬스터 전투 문서
- `260417`: `Monster Wait Task`, `Monster Patrol Task`, 엔진/에디터 버그 수정 사례를 통해 몬스터가 비전투 상태에서 대기하고 순찰하는 루프를 만들고, 순찰이 꼬일 때 어떻게 디버깅하는지 다루는 문서
- `260420`: `Monster Death`, `AnimNotify_Death`, `Ragdoll`, `Physics Asset`, `ItemBox`, `Drop Animation`, `Overlap Pickup`을 묶어 몬스터 사망 이후 쓰러짐, 드롭, 획득까지 마무리하고, 그 후반 파이프라인이 현재 `MonsterGAS::Death()`와 `EndPlay()`에도 어떻게 이어지는지 추적하는 문서
- `260421`: `GASDocumentation` 예제 프로젝트를 기준으로 `ASC`, `AttributeSet`, `GameplayAbility`, `GameplayEffect`, `GameplayTag`를 처음부터 다시 정리하고, 이를 `초급`, `중급`, `고급`, `부록`으로 나눠 `GDGA_CharacterJump`, `GDGA_FireGun`, `GDAttributeSetBase`, `GDDamageExecCalculation`, `GDPlayerState`까지 단계적으로 읽는 문서. Epic 공식 문서 연결과 별도 공식 문서 참고 가이드도 포함한다.
- `260422`: `UE20252` 실제 프로젝트 코드로 돌아와 `ShinbiGAS`, `GameplayAbility_Attack`, `GameplayAbility_Base`, `GameplayEffect_ManaCost`, `GameplayEffect_Damage`, `GameplayCueNotify_StaticBase`, `BaseAttributeSet`을 중심으로 `GameplayEvent -> ManaCost GameplayEffect -> SetByCaller -> ApplyGameplayEffectSpecToSelf -> ApplyGameplayEffectSpecToTarget -> PostGameplayEffectExecute -> GameplayCue` 흐름을 체감하는 보충 문서
- `260423`: `GameplayAbility_Attack`, `GameplayEffect_Damage`, `GameplayCueNotify_StaticBase`, `MonsterGAS`, `MonsterGASController`, `MonsterNormalGAS_Warrior`, `BTTask_TraceGAS`, `BTTask_AttackGAS`를 중심으로 `GAS 공격 완성 -> GameplayCue 타격 연출 -> MonsterGAS 전투 적용`까지 이어지는 보충 문서
- `260424`: `BaseAttributeSet`, `MonsterGAS`, `MonsterAttributeSet`, `GameplayAbility_Base`, `GameplayEffect_ManaCost`, `GameplayEffect_CoolDown`, `PlayerAnimInstance`, `PlayerTemplateAnimInstance`, `AcademyUtilityPlugin`을 중심으로 사망 처리 진입점, 커스텀 ASC 구조, AbilityTask 전환, 덤프 워크플로를 함께 정리하는 문서

## 저장소 구조

- `index.md`: 루트 서가
- `260401/index.md`: 2026-04-01 강의 교재
- `260402/index.md`: 2026-04-02 강의 교재
- `260403/index.md`: 2026-04-03 강의 교재
- `260406/index.md`: 2026-04-06 강의 교재
- `260407/index.md`: 2026-04-07 강의 교재
- `260408/index.md`: 2026-04-08 강의 교재
- `260409/index.md`: 2026-04-09 강의 교재
- `260410/index.md`: 2026-04-10 강의 교재
- `260413/index.md`: 2026-04-13 강의 교재
- `260414/index.md`: 2026-04-14 강의 교재
- `260415/index.md`: 2026-04-15 강의 교재
- `260416/index.md`: 2026-04-16 강의 교재
- `260417/index.md`: 2026-04-17 강의 교재
- `260420/index.md`: 2026-04-20 강의 교재
- `260421/index.md`: 2026-04-21 GASDocumentation 기반 GAS 입문 교재
- `260422/index.md`: 2026-04-22 UE20252 실전 GameplayEffect 및 Damage/Cue 보충 교재
- `260423/index.md`: 2026-04-23 UE20252 실전 GAS 공격 완성, GameplayCue, MonsterGAS 연결 보충 교재
- `260424/index.md`: 2026-04-24 MonsterGAS 사망 처리, 커스텀 ASC, AbilityTask, AcademyUtility 부록 교재
- `260421/assets/images`: GAS 입문 교재용 이미지 자리
- `260422/assets/images`: UE20252 실전 GameplayEffect 교재용 이미지 자리
- `260423/assets/images`: UE20252 실전 GAS 공격 완성, GameplayCue, MonsterGAS 교재용 이미지 자리
- `260424/assets/images`: 260424 교재용 이미지 자리
- `260401/assets/images`, `260402/assets/images`, `260403/assets/images`, `260406/assets/images`, `260407/assets/images`, `260408/assets/images`, `260409/assets/images`, `260410/assets/images`, `260413/assets/images`, `260414/assets/images`, `260415/assets/images`, `260416/assets/images`, `260417/assets/images`, `260420/assets/images`: 원본 영상에서 다시 추출한 캡처
