---
title: 260416 05 현재 프로젝트 C++ 부록
---

# 260416 05 현재 프로젝트 C++ 부록

[260416 허브](../) | [이전: 04 공식 문서 부록](../04_appendix_official_docs_reference/)

## 문서 개요

`260416`을 현재 프로젝트 C++ 기준으로 다시 읽으면, 이 날짜의 핵심은 "공격 기능 추가"보다 `AI 태스크`, `애니메이션 노티파이`, `실제 데미지 계층`을 정확한 순서로 연결하는 데 있다.

## 1. 현재 전투 루프의 큰 흐름

legacy 기준 큰 흐름은 아래와 같다.

1. `Trace` 태스크가 타깃을 향해 달리게 만든다
2. 공격 거리 안에 들어오면 `Trace`가 닫힌다
3. `Attack` 태스크가 `AttackTarget`과 `AttackEnd` 문맥을 세팅한다
4. `AnimNotify_Attack()`이 실제 타격 프레임을 연다
5. `NormalAttack()`이 데미지를 적용한다
6. `AnimNotify_AttackEnd()`가 다음 재평가 시점을 연다

즉 `260416`은 한 함수보다 `시간축을 따라 신호가 이동하는 구조`로 읽는 편이 정확하다.

## 2. `UMonsterGASAnimInstance`도 노티파이 계약을 거의 그대로 유지한다

현재 `UMonsterGASAnimInstance`는 아래 세 함수를 그대로 들고 있다.

- `AnimNotify_Attack()`
- `AnimNotify_AttackEnd()`
- `AnimNotify_Death()`

즉 현재 branch에서도 애니메이션 노티파이는 여전히 전투 타이밍의 허브다.
달라진 것은 마지막 데미지 계산 계층이지, `Attack / AttackEnd / Death` 계약 자체는 거의 유지된다.

## 3. `BTTask_TraceGAS`와 `BTTask_AttackGAS`는 수치 공급원만 AttributeSet으로 바뀌었다

현재 `BTTask_TraceGAS`는 공격 거리 판정을 `Monster->GetAttributeSet()->GetAttackDistance()`에서 읽고,
`BTTask_AttackGAS`도 공격 종료 후 거리 재평가를 같은 방식으로 수행한다.

즉 이 날짜의 전투 전이 규칙은 그대로이고, 수치 저장 위치만 `MonsterState`에서 `AttributeSet`으로 옮겨 갔다고 보면 된다.

## 4. 워리어는 `Ability.Attack` 이벤트로 실제 데미지를 넘긴다

현재 `AMonsterNormalGAS_Warrior::NormalAttack()`는 `AttackTarget`을 읽어 곧바로 `TakeDamage()`를 호출하지 않는다.
대신 `Ability.Attack` 태그가 달린 `FGameplayEventData`를 자기 자신에게 보낸다.

이 이벤트는 `UGameplayAbility_Attack`에서 아래 일을 한다.

- `SourceASC`와 `TargetASC` 확보
- `Attack`, `Defense` 수치 읽기
- `Attack - Defense` 계산
- `UGameplayEffect_Damage`에 `Effect.Battle.Damage` 값으로 넣기
- `ApplyGameplayEffectSpecToTarget()` 호출

즉 현재 워리어의 실제 전투 루프는 아래처럼 읽는 편이 맞다.

`AttackTask -> AnimNotify_Attack() -> NormalAttack() -> Ability.Attack -> GameplayAbility_Attack -> GameplayEffect_Damage`

## 5. 거너는 아직 연출 중심 상태다

반대로 `AMonsterNormalGAS_Gunner::NormalAttack()`는 아직 `Ability.Attack` 이벤트를 보내지 않고, `AttackTarget` 위치에 파티클만 뿌린다.

즉 현재 branch에선 같은 `AttackTarget`, `AttackEnd`, `AnimNotify` 뼈대를 유지한 채,
마지막 데미지 전달 계층만 워리어부터 GAS 쪽으로 갈아끼우고 있는 셈이다.

## 6. 전투 루프의 끝은 여전히 몬스터 본체가 책임진다

현재 `AMonsterGAS::TakeDamage()`에 예전 수동 HP 차감 로직은 주석 처리돼 있지만, `Death()` 쪽 랙돌/수명 정리 코드는 여전히 남아 있다.
즉 "HP를 깎는 층"은 `GameplayEffect` 쪽으로 이동했어도, "죽은 뒤 몸체를 물리적으로 정리하는 층"은 여전히 몬스터 본체가 맡는다.

## 정리

현재 프로젝트 C++ 기준으로 다시 보면 `260416`의 전투 루프는 아래 한 문장으로 요약할 수 있다.

`Trace 태스크가 공격 거리까지 데려간다 -> Attack 태스크가 공격 문맥을 세팅한다 -> AnimNotify가 정확한 프레임을 연다 -> Warrior는 GAS Ability/Effect로 데미지를 넘기고, Death 후반 처리는 여전히 몬스터 본체가 맡는다`

[260416 허브](../) | [이전: 04 공식 문서 부록](../04_appendix_official_docs_reference/)
