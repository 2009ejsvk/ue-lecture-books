---
title: 260406 부록 1 - 공식 문서로 다시 읽는 플레이어 구조
---

# 부록 1. 공식 문서로 다시 읽는 플레이어 구조

[이전: 중급 2편](../03_intermediate_rotation_jump_attack_loop/) | [허브](../) | [다음: 부록 2](../05_appendix_current_project_cpp_reference/)

## 이 부록의 목표

이 부록에서는 `260406`에서 배운 플레이어 C++ 전환 구조를 언리얼 공식 문서의 표준 용어와 연결한다.
즉 `PlayerCharacter`, `GameMode`, `Controller`, `Enhanced Input`이 각각 공식 문서에서 어떤 역할 이름으로 설명되는지 정리하는 편이다.

## 먼저 보면 좋은 공식 문서

- [Gameplay Framework in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-framework-in-unreal-engine)
- [Setting Up a Character in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-a-character-in-unreal-engine)
- [Setting Up a Game Mode in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-a-game-mode-in-unreal-engine)
- [Enhanced Input in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine)
- [Quick Start Guide to Player Input in Unreal Engine C++](https://dev.epicgames.com/documentation/en-us/unreal-engine/quick-start-guide-to-player-input-in-unreal-engine-cpp?application_version=5.6)
- [Implementing your Character in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/implementing-your-character-in-unreal-engine)

## `Gameplay Framework`는 강의의 책임 분리를 한 번에 묶어 준다

강의가 `APlayerCharacter`, `AMainPlayerController`, `ADefaultGameMode`를 굳이 따로 두는 이유는 공식 문서의 `Gameplay Framework`를 보면 더 선명해진다.

- `Character`
  월드 안에서 움직이고 보이는 플레이어 본체
- `PlayerController`
  입력과 조종 문맥을 가지는 주체
- `GameMode`
  어떤 Pawn과 Controller를 기본으로 쓸지 정하는 월드 규칙

즉 `260406`은 단순 C++ 문법 수업이 아니라, 플레이어 구조를 언리얼 표준 프레임워크에 맞춰 재정렬하는 날이라고 볼 수 있다.

## `Setting Up a Character`는 왜 `Character` 기반이 자연스러운지 다시 보여 준다

공식 문서도 플레이어 출발점을 보통 `Character`로 잡는다.
이 클래스는 캡슐 충돌, 메시 연결, 이동 컴포넌트 같은 기본 부품을 이미 갖고 있기 때문이다.
그래서 강의가 `APlayerCharacter`를 `ACharacter` 기반으로 만든 것은 아주 정석적인 선택이다.

## `Game Mode`와 `Enhanced Input`는 진입점과 입력 파이프라인을 분리해 읽게 만든다

`Setting Up a Game Mode`는 `DefaultPawnClass`, `PlayerControllerClass`가 왜 월드 규칙인지 설명해 준다.
반면 `Enhanced Input`과 `Player Input` 문서는 `Mapping Context`, `Input Action`, 바인딩이 왜 별도 자산과 등록 단계로 나뉘는지 보여 준다.

![BeginPlay에서 MappingContext 등록](../assets/images/mappingcontext-beginplay.jpg)

즉 `260406`은 "누가 기본 플레이어인가"와 "그 플레이어가 어떻게 입력을 받는가"를 같은 날짜에 묶어서 완성하는 구조라고 볼 수 있다.

## 추천 읽기 순서

1. `Gameplay Framework`로 책임 분리부터 본다.
2. `Setting Up a Character`로 플레이어 본체 구조를 본다.
3. `Setting Up a Game Mode`로 진입점 문법을 본다.
4. `Enhanced Input`, `Player Input`으로 입력 자산과 바인딩 구조를 본다.
5. `Implementing your Character`로 실제 C++ 플레이어 구현 감각을 다시 본다.

## 이 부록의 핵심 정리

1. `260406`의 분해 방식은 공식 문서 기준으로도 매우 정석적이다.
2. `Character`, `Controller`, `GameMode`, `Enhanced Input`은 서로 다른 주제가 아니라 하나의 플레이어 구조 체인이다.
3. 공식 문서를 함께 읽으면 뒤의 애니메이션, 콤보, GAS 플레이어 라인으로 넘어갈 때 용어가 훨씬 덜 낯설다.

## 다음 편

[부록 2. 현재 프로젝트 C++로 다시 읽는 전환 구조](../05_appendix_current_project_cpp_reference/)
