---
title: 260409 공격 판정, 데미지, 이펙트, 사운드, 투사체를 묶어 전투 결과 완성하기
---

# 260409 공격 판정, 데미지, 이펙트, 사운드, 투사체를 묶어 전투 결과 완성하기

[← 260408](../260408/) | [루트 허브](../index.md) | [260410 →](../260410/)

## 문서 개요

`260409`의 핵심은 "공격 버튼을 눌렀다"를 실제 전투 결과로 바꾸는 데 있다.
전날 `260408`이 `몽타주 + 노티파이 + 템플릿`으로 공격의 시간축을 만든 날이었다면, 오늘은 그 시간축 위에 `충돌 판정`, `TakeDamage`, `파티클`, `사운드`, `투사체`를 붙여 하나의 파이프라인으로 완성하는 날이다.

이번 분권은 기존 통합 문서를 강의 흐름에 맞춰 다시 나누고, 현재 `UE20252` branch에서 달라진 부분도 함께 반영해 정리한 것이다.

## 학습 순서

1. [01 애니메이션 템플릿과 PlayerAnimInstance](./01_intermediate_animation_template_and_player_animinstance/)
2. [02 충돌 채널, 프로파일, Sweep 판정](./02_intermediate_collision_channels_profiles_and_sweep/)
3. [03 데미지, 이펙트, 투사체](./03_intermediate_damage_effects_and_projectiles/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 단일 문서를 `템플릿`, `충돌`, `전투 결과`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 10장을 각 편의 문맥에 맞게 재배치했다.
- 강의 캡처에서 대표 컷 5장을 추가해 `템플릿 그래프`, `TMap 필드`, `Project Settings -> Collision`, `Shinbi 스윕 디버그`, `Wraith 원거리 플레이테스트`를 보강했다.
- 현재 branch 기준으로 `UPlayerAnimInstance`, `UPlayerTemplateAnimInstance`, `UAnimNotify_PlayerAttack`가 `APlayerCharacterGAS` 라인을 기준으로 동작한다는 점을 반영했다.
- 예전 문서 초안과 달리, 현재 `AWraithBullet::BulletHit()`은 이미 `TakeDamage()`를 직접 호출하고 있다는 점도 수정해 반영했다.

## 현재 branch 추적 메모

`260409`에서 설명하는 근접/원거리 전투 구조는 여전히 유효하지만, 현재 저장소에는 같은 구조의 두 층이 공존한다.

- legacy 플레이어 라인: `APlayerCharacter`, `AShinbi`, `AWraith`
- GAS 플레이어 라인: `APlayerCharacterGAS`, `AShinbiGAS`, `AWraithGAS`

즉 강의 예제는 여전히 `Shinbi`, `Wraith`, `MonsterBase` 중심으로 읽으면 좋고, 최신 branch 연결성은 `AnimInstance`와 `AnimNotify` 쪽이 GAS 라인으로 옮겨 간 상태라고 보면 된다.

## 핵심 문장

`260409`의 본질은 기능 나열이 아니라 `타격 시점 -> 판정 -> 피해 -> 시각/청각 피드백`을 하나의 전투 파이프라인으로 만드는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260409_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260410](../260410/)에서는 여기서 만든 원거리/피격 파이프라인이 총구 소켓, 데칼, 상하체 분리, 스킬 캐스팅 쪽으로 더 확장된다.

[← 260408](../260408/) | [루트 허브](../index.md) | [260410 →](../260410/)
