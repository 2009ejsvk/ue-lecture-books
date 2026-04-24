---
title: 260401 프로젝트 생성과 언리얼 입문 허브
---

# 260401 프로젝트 생성과 언리얼 입문 허브

[루트](../) | [다음 날짜: 260402](../260402/)

## 문서 개요

`260401`은 언리얼 강의 전체의 출발점이다.
이번 날짜에서는 프로젝트를 어떻게 시작해야 하는지, 에디터 패널을 어떻게 읽어야 하는지, `Actor / Component / Pawn / Character / GameMode / PlayerController`를 어떤 역할로 이해해야 하는지, 그리고 블루프린트 그래프를 어떤 사고방식으로 읽어야 하는지를 순서대로 다룬다.

기존에는 한 파일로 묶여 있었지만, 이번 정리에서는 강의 흐름에 맞춰 아래 여섯 편으로 분권했다.

![프로젝트 브라우저와 템플릿 선택 화면](./assets/images/project-browser-template.jpg)

## 추천 읽기 순서

1. [초급 1편. 프로젝트 생성과 시작 규칙](./01_beginner_project_creation/)
2. [초급 2편. 언리얼 에디터 기본 패널 읽기](./02_beginner_unreal_editor_basics/)
3. [초급 3편. 클래스 구조와 블루프린트 클래스](./03_beginner_class_structure_and_blueprint_classes/)
4. [초급 4편. 블루프린트 기초 프로그래밍](./04_beginner_blueprint_programming_basics/)
5. [부록 1. 언리얼 공식 문서로 다시 읽는 첫날 개념](./05_appendix_official_docs_reference/)
6. [부록 2. 현재 프로젝트 C++로 다시 읽는 첫날 개념](./06_appendix_current_project_cpp_reference/)

## 빠른 선택 가이드

- 프로젝트를 어떤 템플릿과 규칙으로 시작해야 하는지가 궁금하면 [초급 1편](./01_beginner_project_creation/)부터 읽으면 된다.
- 강의 화면의 `Viewport`, `Outliner`, `Details`, `Content Browser`가 자꾸 헷갈리면 [초급 2편](./02_beginner_unreal_editor_basics/)이 가장 직접적이다.
- `Actor`, `Component`, `Pawn`, `Character`, `GameMode`, `PlayerController` 차이를 구조적으로 다시 잡고 싶다면 [초급 3편](./03_beginner_class_structure_and_blueprint_classes/)을 보면 된다.
- `BeginPlay`, `Tick`, 실행 핀, 데이터 핀, `Delta Seconds`, 변수 노출이 왜 중요한지 정리하고 싶다면 [초급 4편](./04_beginner_blueprint_programming_basics/)이 핵심이다.
- 공식 문서 기준 용어와 읽기 순서를 같이 잡고 싶다면 [부록 1](./05_appendix_official_docs_reference/), 현재 `UE20252` 소스와 연결해서 보고 싶다면 [부록 2](./06_appendix_current_project_cpp_reference/)로 이어가면 된다.

## 이번 날짜의 핵심 목표

- 언리얼 프로젝트 생성은 단순 클릭 절차가 아니라 개발 환경의 뼈대를 정하는 일이라는 점을 이해한다.
- 에디터 패널을 UI 이름이 아니라 월드 편집 도구로 읽을 수 있게 만든다.
- 클래스 구조와 블루프린트가 분리된 개념이 아니라, 같은 객체 시스템의 다른 표현 방식이라는 감각을 잡는다.
- 블루프린트를 “쉬운 대체재”가 아니라 이벤트 생명주기와 데이터 흐름을 가진 정식 프로그래밍 인터페이스로 읽기 시작한다.

## 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260401_1_언리얼 프로젝트 생성.mp4`
- `D:\UE_Academy_Stduy_compressed\260401_2_언리얼 에디터.mp4`
- `D:\UE_Academy_Stduy_compressed\260401_3_언리얼 클래스 구조와 블루프린트 클래스.mp4`
- `D:\UE_Academy_Stduy_compressed\260401_4_블루프린트 기초 프로그래밍.mp4`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 읽기 메모

이번 날짜는 뒤의 `260406`, `260414`, `260421`처럼 특정 기능 구현을 설명하는 날이 아니라, 이후 모든 날짜에서 반복해서 쓰게 될 언리얼 기본 문법을 심는 날이다.
그래서 가장 좋은 읽기 방법은 “한 번에 외우기”보다 “이 용어가 나중에 어디에 다시 나오나”를 붙잡는 쪽이다.

