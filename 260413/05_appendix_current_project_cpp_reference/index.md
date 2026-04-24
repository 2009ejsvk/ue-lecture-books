---
title: 260413 05 현재 프로젝트 C++로 다시 읽는 위치 기반 스킬 파이프라인
---

# 260413 05 현재 프로젝트 C++로 다시 읽는 위치 기반 스킬 파이프라인

[이전: 04 GeometryCollection C++](../04_intermediate_geometry_collection_cpp_and_external_strain/) | [260413 허브](../) | [다음 날짜: 260414](../../260414/)

## 문서 개요

현재 프로젝트 기준으로 `260413`의 진짜 성과는 기능 하나가 아니라 `위치 기반 스킬의 전체 파이프라인`을 붙인 데 있다.

## 1. 현재 파이프라인은 한 줄로 이렇게 읽힌다

`AMainPlayerController::GetHitResultUnderCursor() -> AShinbi::Skill1Casting() -> mMagicCircleActor -> AShinbi::InputAttack() -> AGeometryActor::SetGeometryAsset() -> GeometryHit() -> ApplyExternalStrain()`

이 한 줄이 `Pick -> Preview -> Spawn -> React` 네 단계를 그대로 담고 있다.

## 2. 각 클래스의 책임은 비교적 분명하다

- `AMainPlayerController`
  마우스 커서와 Picking 기반 준비
- `AShinbi`
  마법진 생성, 목표 위치 갱신, 평타/스킬 분기
- `ADecalBase`
  목표 지점 시각화
- `AGeometryActor`
  파괴 자산 보관과 런타임 반응

즉 역할이 잘 나뉘어 있어서 이후 다른 지정형 스킬로도 확장하기 좋다.

## 3. 현재 branch에서 같이 봐야 할 점

현재 저장소는 legacy와 GAS가 함께 있다.

- legacy `AShinbi`
  `Skill1Casting()`, `Tick()`, `InputAttack()` 흐름이 비교적 완결돼 있다.
- `AShinbiGAS`
  `Skill1Casting()`과 마법진 생성은 유지되지만, `InputAttack()`의 지정형 스킬 확정 분기 일부가 주석 처리되어 있다.

즉 `260413`의 설명 흐름은 지금도 맞지만, 최신 branch에선 지정형 스킬 전체 경험이 legacy 쪽에 더 잘 남아 있다고 보는 편이 정확하다.

## 4. `Build.cs` 기준으로도 현재 branch 변화가 조금 보인다

원래 강의 축과 직접 연결되는 모듈은 `GeometryCollectionEngine`, `Chaos`, `FieldSystemEngine`이지만, 지금 `UE20252.Build.cs`에는 `Niagara`까지 함께 포함돼 있다.
즉 파괴/이펙트 쪽 확장을 염두에 둔 현재 branch 상태도 같이 보인다고 볼 수 있다.

## 5. 지금 코드의 확장 포인트

뼈대는 충분히 좋지만, 아직 남은 과제도 분명하다.

- 평타/스킬 캔슬 규칙 정교화
- 최대 사거리 제한
- 범위 밖 클릭 처리
- 마법진 크기와 실제 판정 범위 일치
- 파괴 뒤 추가 데미지나 이펙트 확장

즉 이번 날짜는 위치 기반 스킬의 완성형이라기보다, `다른 지정형 스킬을 계속 얹을 수 있는 공통 뼈대`를 세운 날이다.

## 정리

현재 프로젝트 C++ 기준으로 `260413`은 아래 문장으로 가장 잘 요약된다.

`마우스로 월드 위치를 고르고, 그곳을 데칼로 먼저 보여 준 뒤, 실제 파괴 가능한 액터를 떨어뜨려 Geometry Collection 반응으로 마무리하는 날`

[이전: 04 GeometryCollection C++](../04_intermediate_geometry_collection_cpp_and_external_strain/) | [260413 허브](../) | [다음 날짜: 260414](../../260414/)
