---
title: 260401 부록 1 - 언리얼 공식 문서로 다시 읽는 첫날 개념
---

# 부록 1. 언리얼 공식 문서로 다시 읽는 첫날 개념

[이전: 초급 4편](../04_beginner_blueprint_programming_basics/) | [허브](../) | [다음: 부록 2](../06_appendix_current_project_cpp_reference/)

## 이 편의 목표

이 부록은 `260401`에서 배운 프로젝트 생성, 에디터 패널, 객체 구조, 블루프린트 기초를 언리얼 공식 문서의 표준 용어와 연결해 두기 위한 정리다.
즉 강의 내용을 새로 바꾸는 편이 아니라, 자습할 때 어떤 문서를 어떤 순서로 보면 좋은지 길을 잡아 주는 편이라고 보면 된다.

## 먼저 보면 좋은 공식 문서

- [Unreal Engine for New Users](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-for-new-users)
- [Create your First Project in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/create-your-first-project-in-unreal-engine)
- [Unreal Editor Interface](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-editor-interface)
- [Introduction to Blueprints](https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-blueprints?application_version=5.7)
- [Reflection System in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/reflection-system-in-unreal-engine)
- [Unreal Engine Actors Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-actors-reference)
- [Gameplay Framework in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-framework-in-unreal-engine)
- [Setting Up a Character in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-a-character-in-unreal-engine)
- [Setting Up a Game Mode in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-a-game-mode-in-unreal-engine)

## 프로젝트 시작과 학습 순서

공식 문서도 입문자를 바로 복잡한 시스템으로 던지지 않는다.
먼저 프로젝트를 만들고, 에디터를 읽고, 월드를 움직이는 기본 인터페이스를 익히게 만든다.

즉 `260401` 1편과 2편에서 다룬 아래 흐름은 공식 문서 기준으로도 매우 정석적이다.

`프로젝트 생성 -> 에디터 인터페이스 -> 뷰포트 조작 -> 기본 객체 이해`

## 에디터 패널은 공식 문서에서도 같은 중심축을 가진다

`Unreal Editor Interface` 문서가 설명하는 핵심 패널도 현재 교재와 거의 같다.

- `Viewport`
  월드 편집 공간
- `Outliner`
  월드 오브젝트 목록
- `Details`
  선택한 대상의 속성 창
- `Content Browser`
  에셋 탐색과 관리
- `Play-In-Editor`
  에디터 안에서 즉시 실행하는 검증 루프

즉 강의에서 에디터 패널을 먼저 읽는 순서는 수업용 편의가 아니라, 공식 문서 기준으로도 자연스러운 입문 순서다.

## `UObject`, 리플렉션, `Actor / Pawn / Character` 축도 공식 문서와 바로 이어진다

`Reflection System` 문서는 언리얼 객체의 기반을 `UObject`로 두고, `UCLASS`, `UPROPERTY`, `UFUNCTION` 같은 매크로가 엔진과 에디터 노출을 어떻게 연결하는지 설명한다.
그리고 `Actors Reference`, `Gameplay Framework` 문서는 `Actor`, `Pawn`, `Character`, `PlayerController`, `GameMode`를 게임플레이 프레임워크의 핵심 축으로 묶는다.

즉 `260401`에서 배운 아래 감각은 공식 문서 언어로도 그대로 번역된다.

- `Actor`
  레벨에 배치되는 월드 단위
- `Pawn`
  플레이어나 AI가 빙의할 수 있는 몸체
- `Character`
  인간형 이동용 기본 부품이 붙은 `Pawn`
- `PlayerController`
  입력과 빙의 주체
- `GameMode`
  월드 기본 규칙

## 블루프린트 입문도 공식 문서와 결이 같다

`Introduction to Blueprints` 문서가 강조하는 핵심도 `260401` 4편과 거의 같다.

- 블루프린트는 노드 기반 프로그래밍 인터페이스다.
- 가장 흔한 형태는 `Blueprint Class`다.
- `Construction Script`와 `Event Graph`는 실행 시점이 다르다.
- 실행 핀과 데이터 핀이 모두 중요하다.
- 변수 공개와 인스턴스 편집 가능 설정은 재사용성과 조정 가능성을 만든다.

즉 첫날 블루프린트 강의는 로컬 실습용 요약이 아니라, 공식 문서 입문 흐름과도 잘 맞는 기본 골격이다.

## 추천 읽기 순서

1. [Unreal Engine for New Users](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-for-new-users)
2. [Create your First Project in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/create-your-first-project-in-unreal-engine)
3. [Unreal Editor Interface](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-editor-interface)
4. [Introduction to Blueprints](https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-blueprints?application_version=5.7)
5. [Reflection System in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/reflection-system-in-unreal-engine)
6. [Unreal Engine Actors Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-actors-reference)
7. [Gameplay Framework in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-framework-in-unreal-engine)
8. [Setting Up a Character in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-a-character-in-unreal-engine)
9. [Setting Up a Game Mode in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-a-game-mode-in-unreal-engine)

## 이 편의 핵심 정리

1. `260401`의 기본 개념은 공식 문서 기준으로도 매우 정석적인 입문 흐름이다.
2. 프로젝트 생성, 에디터 패널, 객체 구조, 블루프린트 기초는 공식 문서에서도 먼저 잡는 축이다.
3. 뒤 날짜에서 낯선 용어가 나오기 시작하면, 이 부록의 문서 링크로 다시 돌아오면 복습 동선이 안정된다.

## 다음 편

[부록 2. 현재 프로젝트 C++로 다시 읽는 첫날 개념](../06_appendix_current_project_cpp_reference/)

