---
title: 260403 충돌 판정, 태그, 타이머, 트리거 박스로 상호작용과 함정을 만드는 기초
---

# 260403 충돌 판정, 태그, 타이머, 트리거 박스로 상호작용과 함정을 만드는 기초

## 문서 개요

이 문서는 `260403_1`부터 `260403_3`까지의 강의를 하나의 연속된 교재로 다시 정리한 것이다.
이번 날짜의 핵심은 플레이어와 발사체를 "보이게 만드는 단계"에서 한 걸음 더 나아가, 누가 누구와 부딪히는지, 그 충돌을 어떻게 판정할지, 그리고 그 위에 맵 기믹을 어떻게 올릴지를 배우는 데 있다.
그리고 이번 정리본에서는 여기에 더해, 현재 프로젝트 `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252` 안의 실제 C++ 코드를 함께 읽으면서 `Projectile Stop`, `Hit`, `Overlap`, `TakeDamage`, 타이머 개념이 실전 소스에서 어떤 구조로 이어지는지도 자세히 연결한다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`기본 충돌 이벤트 -> 몬스터 발사 타이머와 태그 구분 -> Trigger Box 기반 함정 -> 실제 C++ 코드로 다시 읽기`

즉 `260403`은 전투 연출 자체보다 "판정 규칙"과 "이벤트 시작점"을 배우는 날이다.
뒤에서 나오는 데미지, AI, 스킬, 애니메이션도 결국은 어떤 대상이 어떤 조건에서 이벤트를 받느냐 위에서 움직이기 때문에, 이 날짜는 프로젝트 전체의 룰 설계 입문에 가깝다.

이 교재는 아래 네 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상 및 자막
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`에 덤프한 `BPBullet`, `BPTestMonster`, `WraithBullet`, `MonsterBase` 자료

## 학습 목표

- `Block`, `Overlap`, `Ignore`의 차이를 실제 게임 판정 관점에서 설명할 수 있다.
- `Projectile Stop`, `Hit`, `Overlap`, `Hit Result`가 언제 쓰이는지 구분할 수 있다.
- 액터 태그가 충돌 이후의 식별 규칙으로 왜 유용한지 설명할 수 있다.
- `Set Timer by Event`로 반복 발사나 주기 이벤트를 만드는 원리를 말할 수 있다.
- `Trigger Box`, `Begin Overlap`, `End Overlap`, `Level Blueprint`를 이용해 맵 기믹을 만드는 흐름을 정리할 수 있다.
- `AProjectileBase`, `AWraithBullet`, `AGeometryActor`, `AItemBox`, `AMonsterBase`, `AMonsterSpawnPoint` 코드를 보고 `260403` 개념이 실제 C++에서 어떻게 보이는지 읽을 수 있다.

## 강의 흐름 요약

1. 발사체와 일반 컴포넌트 충돌을 예제로 삼아, `Block / Overlap / Ignore`와 `Projectile Stop` 이벤트의 의미를 익힌다.
2. 몬스터는 `Set Timer by Event`로 주기적으로 발사하고, 생성된 탄환에는 `PlayerBullet`, `MonsterBullet` 태그를 붙여 소속을 구분한다.
3. 마지막으로 `Trigger Box`와 `Level Blueprint`의 `Begin/End Overlap`을 이용해 보이지 않는 함정 영역을 만들고, 위에서 떨어지는 큐브 같은 맵 기믹을 연결한다.
4. 현재 프로젝트의 C++ 코드를 읽으며, 위 구조가 `ProjectileBase`, `WraithBullet`, `GeometryActor`, `ItemBox`, `MonsterBase`, `MonsterSpawnPoint` 안에서 어떤 식으로 정리되었는지 확인한다.

---

## 제1장. 기본 충돌 시스템: Projectile Stop, Hit, Overlap을 어떻게 읽을 것인가

### 1.1 충돌은 단순 물리 반응이 아니라 게임 규칙이다

첫 강의는 총알이 부딪히고 사라지는 단순한 예제로 시작하지만, 실제로는 언리얼 충돌 시스템의 핵심 규칙을 설명하는 시간이다.
자막에서 가장 먼저 강조하는 말도 "충돌 쪽은 로직이 더 중요하다"는 점이다.

언리얼의 기본 충돌 개념은 세 가지로 정리된다.

- `Block`: 서로 막히는 충돌
- `Overlap`: 통과는 되지만 이벤트는 받는 충돌
- `Ignore`: 아예 무시하는 충돌

이 세 가지를 이해하면, 같은 탄환이라도 벽에는 막히고, 트리거와는 겹치고, 자기 자신은 무시하게 만드는 식의 설계를 읽을 수 있다.
즉 충돌은 단순한 "물리"가 아니라, 어떤 오브젝트가 어떤 오브젝트에 반응할지 정하는 규칙표다.

![충돌 개념이 올라가는 기본 스테이지](./assets/images/collision-channel-concept.jpg)

### 1.2 ProjectileMovement는 투사체 충돌의 가장 쉬운 입문 루트다

강의는 발사체부터 충돌을 설명한다.
그 이유는 발사체는 이동 규칙이 단순하고, 충돌했을 때 멈추거나 사라지는 시점이 분명해서 이벤트 흐름을 이해하기 좋기 때문이다.

현재 프로젝트의 가장 얇은 C++ 예시는 `AProjectileBase`다.

```cpp
mBody = CreateDefaultSubobject<UBoxComponent>(TEXT("Body"));
mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));

SetRootComponent(mBody);
mMovement->SetUpdatedComponent(mBody);

mMovement->OnProjectileStop.AddDynamic(this, &AProjectileBase::ProjectileStop);
```

이 구조는 `260403_1` 강의가 설명한 원리와 거의 정확히 맞아떨어진다.
자막에서도 `ProjectileMovement`에는 이미 충돌 관련 기능이 있고, 충돌 후 멈추는 시점에 `Projectile Stop` 이벤트를 받을 수 있다고 설명한다.

덤프된 `BPBullet`도 같은 흐름을 블루프린트 형태로 보여 준다.
이 자산은 `ProjectileMovement`의 `On Projectile Stop` 이벤트를 받아 `Break Hit Result -> Apply Damage -> Destroy Actor` 순서로 처리한다.
즉 강의의 충돌 입문 예제와 현재 테스트 자산은 "투사체가 멈춘 시점에 충돌 정보를 읽고 후속 로직을 실행한다"는 점에서 완전히 같은 문법을 공유한다.

즉 이 강의의 핵심은 "투사체는 굳이 복잡한 물리 계산을 직접 짜지 않아도, 엔진이 준비한 이동 컴포넌트와 이벤트를 잘 조합하면 기본 판정이 만들어진다"는 점이다.

![Projectile Stop 기반 충돌 흐름](./assets/images/projectile-stop-event.jpg)

### 1.3 충돌 후 Destroy는 가장 기본적인 발사체 처리다

강의 중반부는 매우 실용적이다.
충돌했을 때 무슨 거창한 반응을 만들기보다, 일단 충돌 사실을 잡고 `Destroy Actor`를 호출해 사라지게 만드는 가장 기본 루프부터 익힌다.

이 선택이 좋은 이유는 명확하다.

- 충돌 이벤트가 실제로 들어오는지 바로 검증할 수 있다.
- 충돌체 설정이 맞는지 빠르게 확인할 수 있다.
- 이후 이펙트, 데미지, 데칼, 사운드는 그 위에 얹으면 된다.

현재 소스의 `AWraithBullet`는 그 "다음 단계"까지 보여 주는 좋은 예다.

```cpp
mBody->SetCollisionProfileName(TEXT("PlayerAttack"));
mBody->OnComponentHit.AddDynamic(this, &AWraithBullet::BulletHit);

void AWraithBullet::BulletHit(UPrimitiveComponent* HitComponent, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
    Destroy();
    UGameplayStatics::SpawnEmitterAtLocation(GetWorld(), mHitParticle, Hit.ImpactPoint);
    UGameplayStatics::SpawnSoundAtLocation(GetWorld(), mHitSound, Hit.ImpactPoint);
}
```

즉 `260403`에서는 "맞으면 지운다" 수준으로 시작하지만, 프로젝트가 진행되면 그 자리에 파티클, 사운드, 데칼이 붙으면서 완성형 탄환이 된다.

여기서도 충돌 이벤트가 하나만 있는 것은 아니라는 점이 중요하다.
현재 저장소는 세 가지 대표 진입점을 함께 보여 준다.

- `BPBullet`: `ProjectileMovement`의 `OnProjectileStop`
- `AWraithBullet`: 충돌체의 `OnComponentHit`
- `AItemBox`: 충돌체의 `OnComponentBeginOverlap`

즉 `Projectile Stop`, `Hit`, `Overlap`은 서로 경쟁하는 개념이 아니라, 액터의 성격과 충돌 설정에 따라 다른 이벤트 입구라고 보는 편이 정확하다.

### 1.4 Hit Result는 충돌이 일어난 위치와 상대를 읽는 창구다

자막에서는 `Break Hit Result`도 짚어 준다.
이 말은 곧, 충돌 이벤트는 단순히 "맞았다"만 알려 주는 것이 아니라, 어디를 맞았는지, 어떤 법선 방향으로 부딪혔는지, 누구와 충돌했는지 같은 정보 묶음을 전달한다는 뜻이다.

`AWraithBullet::BulletHit()`도 실제로는 그 정보를 사용해 `Hit.ImpactPoint`, `Hit.ImpactNormal`을 읽고 있다.

```cpp
UGameplayStatics::SpawnDecalAtLocation(
    GetWorld(), mHitDecal,
    FVector(20.0, 20.0, 10.0),
    Hit.ImpactPoint,
    (-Hit.ImpactNormal).Rotation(), 5.f);
```

즉 `Hit Result`는 충돌의 "증거 자료"다.
처음에는 파괴만 해도 충분하지만, 나중에는 이 자료를 바탕으로 데칼을 붙이고, 피격 방향을 계산하고, 파편 연출까지 만들 수 있다.

### 1.5 일반 컴포넌트 Hit로도 같은 원리가 확장된다

강의 후반은 "이제 같은 원리를 일반 Static Mesh 컴포넌트 충돌 쪽으로도 확장해 보겠다"고 말한다.
이 포인트가 중요하다.
투사체는 입문용이고, 실제 프로젝트에서는 월드 오브젝트나 파괴 기믹도 결국 같은 `Hit` 이벤트 개념 위에서 동작하기 때문이다.

현재 프로젝트에서는 `AGeometryActor`가 그 확장 예시 역할을 한다.

```cpp
mGeometry->OnComponentHit.AddDynamic(this, &AGeometryActor::GeometryHit);

void AGeometryActor::GeometryHit(UPrimitiveComponent* HitComponent, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
    mGeometry->ApplyExternalStrain(ItemIndex, Hit.ImpactPoint, 50.f, 1, 1.f, 1500000.f);
}
```

여기서도 흐름은 같다.

- 충돌을 받는다.
- `Hit Result`를 읽는다.
- 충돌 위치를 기반으로 후속 로직을 실행한다.

즉 `260403`이 가르치는 충돌 철학은 뒤 날짜의 파괴 오브젝트, 스킬 이펙트, 데미지 시스템까지 그대로 이어진다.

![충돌 원리의 일반 오브젝트 확장](./assets/images/staticmesh-hit-expand.jpg)

### 1.6 장 정리

제1장의 핵심은 충돌을 "물리 현상"이 아니라 "게임 규칙의 시작점"으로 보는 것이다.
`ProjectileMovement`, `Projectile Stop`, `Hit`, `Hit Result`, `Destroy` 조합만 익혀도 아주 많은 기본 게임플레이를 만들 수 있다.

---

## 제2장. 기본 몬스터 제작과 액터 태그: 발사 주기와 소속 구분을 어떻게 붙일 것인가

### 2.1 Set Timer by Event는 반복 행동의 가장 간단한 리듬 장치다

두 번째 강의는 앞부분 녹화가 조금 비어 있지만, 핵심은 명확하다.
몬스터가 일정 시간마다 발사하도록 `Set Timer by Event`를 붙이는 흐름을 다룬다.

자막에서는 다음 점을 순서대로 설명한다.

- `Set Timer by Event`를 쓰면 특정 주기로 이벤트를 반복 실행할 수 있다.
- `Loop`를 켜면 계속 반복되고, 끄면 한 번만 실행된다.
- `Timer Handle`을 받아 두면 나중에 정지나 초기화가 가능하다.

즉 타이머는 "시간 간격으로 행동을 호출하는 리듬 장치"다.
AI가 본격적으로 들어가기 전 단계에서, 몬스터가 정해진 템포로 불을 뿜거나 탄환을 쏘거나 함정을 작동시키는 데 매우 유용하다.

덤프된 `BPTestMonster`는 이 설명을 거의 교과서처럼 증명한다.
`BeginPlay`에서 `Set Timer by Event`를 호출하고, 시간은 `1.0`, `bLooping`은 `true`로 설정되어 있으며, 델리게이트는 `Fire` 커스텀 이벤트에 연결되어 있다.
즉 강의가 설명한 "반복 발사를 가장 싼 비용으로 만들기"가 현재 테스트 블루프린트 안에 그대로 남아 있다.

![몬스터 발사 타이머 시작점](./assets/images/monster-timer-fire.jpg)

### 2.2 Fire 이벤트는 나중에 무기가 아니라 행동 단위로 확장된다

강의에서는 `Fire` 같은 커스텀 이벤트를 하나 만들고, 타이머가 돌 때마다 그것이 호출되게 만든다.
이 구조가 좋은 이유는 발사 주기와 실제 발사 로직이 분리되기 때문이다.

- 타이머는 "언제"를 결정한다.
- `Fire` 이벤트는 "무엇을" 할지 결정한다.

이 구분은 나중에 총알 대신 스킬, 범위기, 함정 발동 같은 다른 행동으로도 바로 확장된다.
즉 `260403_2`는 단순한 블루프린트 노드 사용법보다 "행동을 시간과 분리해 설계하는 법"을 먼저 알려 주는 셈이다.

`BPTestMonster` 덤프를 더 보면 `Fire` 이벤트는 실제로 다음 순서로 이어진다.

- `GetActorLocation() + GetActorForwardVector() * 150`
- `GetActorRotation()`
- `Make Transform`
- `SpawnActor BPBullet`
- 반환된 탄환 인스턴스의 `Tags` 배열에 `MonsterBullet` 추가

즉 타이머는 단순히 함수를 부르는 것이 아니라, "정해진 주기로 탄환 인스턴스를 만들고 그 인스턴스에 소속 정보를 기록하는 구조"까지 함께 완성한다.

### 2.3 태그는 액터의 가장 가벼운 식별자다

강의의 중심은 곧 태그 설명으로 옮겨간다.
언리얼의 모든 액터는 태그를 가질 수 있고, 컴포넌트에도 태그를 붙일 수 있으며, 이것은 쉽게 말해 "이름표" 역할을 한다는 것이다.

이 설명이 중요한 이유는 몬스터와 플레이어가 같은 탄환 블루프린트를 공유할 수도 있기 때문이다.
겉모습은 같은 총알이어도, 누가 쐈는지를 구분해야 자기 총알엔 맞지 않고 상대 총알에만 반응하도록 만들 수 있다.

자막에서도 이 점을 아주 직설적으로 말한다.

- 플레이어가 쏜 총알은 `PlayerBullet`
- 몬스터가 쏜 총알은 `MonsterBullet`

즉 태그는 오브젝트의 소속을 구분하는 가장 싸고 빠른 식별자다.

![PlayerBullet 태그를 붙이는 흐름](./assets/images/actor-tag-playerbullet.jpg)

### 2.4 Spawn Actor 다음에 태그를 붙이는 이유

강의는 `Spawn Actor`의 반환값으로 생성된 액터 레퍼런스를 받은 뒤, 거기에 태그를 넣는 흐름을 보여 준다.
중요한 점은 "총알 블루프린트 자체"에 태그를 박아 두는 것이 아니라, 생성된 인스턴스에 상황별 태그를 붙인다는 데 있다.

이렇게 해야 같은 블루프린트라도 상황에 따라 다른 소속으로 사용할 수 있다.
예를 들어 플레이어가 발사하면 `PlayerBullet`, 몬스터가 발사하면 `MonsterBullet`을 붙이는 식이다.

현재 C++ 소스에도 그 흔적이 남아 있다.
`APlayerCharacter::AttackKey()`의 초기 프로토타입에는 이런 주석이 있다.

```cpp
TObjectPtr<ATestBullet> Bullet =
    GetWorld()->SpawnActor<ATestBullet>(SpawnLoc, GetActorRotation(), param);

Bullet->SetLifeSpan(5.f);
Bullet->Tags.Add(TEXT("PlayerBullet"));
```

즉 `BPTestMonster` 덤프에서는 `MonsterBullet` 태그 부여가 실제로 살아 있고, `APlayerCharacter` 쪽 초기 프로토타입 주석에는 `PlayerBullet` 태그 흔적이 남아 있다.
따라서 `260403` 강의에서 실습한 태그 기반 식별 구조가 블루프린트 프로토타입과 C++ 전환 과정 모두에 걸쳐 존재했음을 확인할 수 있다.

### 2.5 태그와 Damage 시스템을 함께 써야 판정 규칙이 완성된다

자막 후반부는 이번 파일의 핵심을 정확히 정리한다.
충돌은 일단 받고, 그다음 로직에서 태그를 보고 체력을 깎을지 말지를 결정하는 구조가 중요하다는 것이다.

즉 충돌과 식별은 역할이 다르다.

- 충돌: "무언가 부딪혔다"는 사실을 알려 준다.
- 태그: "그 부딪힌 것이 누구 소속인가"를 알려 준다.
- 데미지 로직: 그 결과 실제로 체력을 깎을지 결정한다.

현재 프로젝트에서는 이 흐름이 태그에서 팀 ID와 데미지 함수 쪽으로 조금 더 발전해 있다.
`APlayerCharacter`와 `AMonsterBase`는 각각 팀 ID를 가지고, `TakeDamage()`를 통해 실제 피격 반응을 처리한다.

```cpp
GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
SetGenericTeamId(FGenericTeamId(TeamPlayer));

mBody->SetCollisionProfileName(TEXT("Monster"));
SetGenericTeamId(FGenericTeamId(TeamMonster));
```

그리고 몬스터 쪽은 실제로 `TakeDamage()`에서 체력을 깎고 죽음 처리까지 한다.

```cpp
float Dmg = Super::TakeDamage(DamageAmount, DamageEvent, EventInstigator, DamageCauser);
Dmg -= mDefense;
mHP -= Dmg;
```

흥미로운 점은 태그 방식이 현재 테스트 자산에서도 여전히 직접 보인다는 것이다.
`BPTestMonster`의 `AnyDamage` 그래프는 `DamageCauser -> ActorHasTag("MonsterBullet")`로 먼저 소속을 검사하고, 자기 진영 탄환이면 무시하고 아니면 `HP`를 깎아 `Destroy Actor`까지 연결한다.
즉 강의의 태그 판정은 단순 설명이 아니라, 실제 덤프 안에서 끝까지 실행 흐름으로 확인되는 규칙이다.

즉 `260403`은 태그와 `Any Damage`를 결합해 "누가 누구를 때릴 수 있는가"를 배우는 날이고, 이후 프로젝트는 그 규칙을 충돌 프로필, 팀 ID, `TakeDamage()`로 더 정교하게 끌고 간다.

![태그와 데미지 필터링의 결합](./assets/images/damage-tag-filter.jpg)

### 2.6 장 정리

제2장의 결론은 간단하다.
타이머는 행동의 주기를 만들고, 태그는 오브젝트의 소속을 구분하며, 데미지 로직은 그 식별 결과를 실제 체력 변화로 바꾼다.
이 세 가지가 붙으면 비로소 "누가 누구를 맞히는가"가 정리된다.

---

## 제3장. Trigger Box와 Level Blueprint: 보이지 않는 함정 영역을 만드는 법

### 3.1 전투 규칙 위에 맵 기믹을 올리는 단계

세 번째 강의는 지금까지 만든 플레이어, 몬스터, 총알, 충돌 같은 기본 구조를 바탕으로, 이제 그 위에 맵 기믹을 얹어보는 단계라고 설명한다.
즉 트리거 함정은 완전히 새로운 주제가 아니라, 앞선 충돌 규칙의 응용편이다.

예시도 아주 교재적이다.

- 특정 위치에 들어가면 위에서 돌이 떨어진다.
- 문이 열린다.
- 플레이어를 밀어낸다.

이 모든 것은 결국 "보이지 않는 특정 영역에 누가 들어왔는가"라는 질문으로 환원된다.
그래서 트리거는 게임 안에서 이벤트의 시작점, 말 그대로 방아쇠 역할을 한다.

![함정이 놓일 스테이지 개요](./assets/images/trap-overview-stage.jpg)

### 3.2 Trigger Box는 대부분 Overlap으로 쓴다

강의는 `Trigger Box`를 꼭 알아두라고 강조한다.
그 이유는 트리거는 일반적으로 플레이어를 막는 물체가 아니라, 통과는 허용하되 이벤트만 발생시키는 영역이기 때문이다.

자막에서도 분명히 구분한다.

- `Hit`: 막히는 충돌
- `Overlap`: 서로 겹칠 수 있는 충돌
- 트리거는 대부분 `Overlap`으로 사용

이 구분은 중요하다.
트리거가 `Block`으로 동작하면 플레이어는 들어가지 못하고, 이벤트 지점 자체에 도달하기 어렵다.
반대로 `Overlap`이면 플레이어는 자연스럽게 지나가고, 시스템은 그 진입과 이탈을 감지할 수 있다.

### 3.3 Level Blueprint는 레벨 전체를 제어하는 가장 빠른 실습 장소다

강의가 트리거 박스와 함께 `Level Blueprint`를 같이 다루는 것도 의미가 있다.
`Level Blueprint`는 현재 레벨 전체를 제어하는 블루프린트라고 볼 수 있고, 월드에 이미 배치된 액터를 기준으로 바로 이벤트를 연결하기 좋다.

입문 단계에서는 이것이 매우 편하다.

- 함정 오브젝트는 이미 레벨에 있다.
- 트리거 박스도 이미 배치돼 있다.
- 둘을 바로 연결해 실험하기 좋다.

즉 `260403_3`은 시스템을 재사용 가능한 클래스로 정리하는 날이라기보다, "월드에 있는 액터들을 이벤트로 엮어 기믹을 만들 수 있다"는 감각을 익히는 날이다.

![Trigger Box 디테일과 배치 상태](./assets/images/trigger-box-details.jpg)

### 3.4 Begin Overlap과 End Overlap은 진입과 이탈의 쌍이다

강의는 `Trigger Box`를 선택한 뒤 `Level Blueprint`에서 `Begin Overlap`과 `End Overlap` 이벤트를 추가하는 흐름을 보여 준다.
이 둘을 같이 보는 것이 중요하다.

- `Begin Overlap`: 누군가 영역에 들어옴
- `End Overlap`: 누군가 영역에서 나감

즉 트리거는 단순한 "한 번 눌리면 끝" 장치가 아니라, 현재 영역 안에 있는 상태를 다룰 수도 있는 시스템이다.
문을 여는 장치라면 진입에만 반응할 수 있고, 함정 반복 발동이라면 진입/이탈을 둘 다 써서 상태를 바꿀 수도 있다.

![Level Blueprint의 Begin/End Overlap 노드](./assets/images/level-blueprint-begin-end-overlap.jpg)

### 3.5 함정의 본질은 "오버랩을 다른 액터 동작으로 번역하는 것"이다

트리거 자체는 아무 일도 하지 않는다.
플레이어가 지나간 사실을 알려 줄 뿐이다.
실제 함정은 그 이벤트를 다른 액터의 동작으로 번역할 때 생긴다.

강의 예시에서는 위에서 큐브나 돌이 떨어지게 만드는 식으로 연결한다.
즉 구조를 추상화하면 다음과 같다.

1. 보이지 않는 영역을 둔다.
2. 플레이어가 그 영역과 겹친다.
3. `Begin Overlap` 이벤트가 발생한다.
4. 다른 액터의 물리/위치/상태를 바꿔 함정이 작동한다.

이 구조를 이해하면 문, 함정, 스폰, 연출 시작점까지 거의 같은 방식으로 응용할 수 있다.

![오버랩 이후 떨어지는 함정 큐브 예시](./assets/images/trigger-falling-cube.jpg)

### 3.6 이후 프로젝트는 Level Blueprint 실습을 액터 캡슐화로 옮겨 간다

현재 소스 트리를 보면 `260403` 강의처럼 `Level Blueprint`에 직접 묶여 있는 코드는 남아 있지 않다.
대신 비슷한 이벤트 구조가 C++ 액터 안으로 캡슐화되어 있다.

대표적으로 `AGeometryActor`는 월드에 배치된 오브젝트가 `OnComponentHit`를 받아 자기 내부에서 파괴 반응을 처리한다.
또 `AItemBox`는 `OnComponentBeginOverlap`을 바인딩해 플레이어가 닿으면 자기 내부의 `ItemOverlap()`에서 바로 반응을 처리한다.
즉 초반의 레벨 블루프린트 실습은 나중에 "이벤트를 받는 액터가 자기 책임 안에서 처리하는 구조"로 발전한 것이다.

이 변화는 중요한 성장 포인트다.

- 입문 단계: 레벨에서 빠르게 연결하며 원리를 익힌다.
- 확장 단계: 액터나 컴포넌트 내부로 책임을 옮겨 재사용 가능하게 만든다.

따라서 `260403_3`의 함정 강의는 단순한 블루프린트 실습이 아니라, 훗날 오브젝트 지향적으로 정리될 이벤트 시스템의 씨앗이라고 볼 수 있다.

### 3.7 장 정리

제3장의 핵심은 트리거를 "보이지 않는 충돌체"가 아니라 "이벤트 시작점"으로 이해하는 것이다.
`Trigger Box`, `Begin/End Overlap`, `Level Blueprint`만 알아도 전투 외의 맵 연출을 빠르게 만들 수 있다.

---

## 제4장. 현재 프로젝트 C++ 코드로 다시 읽는 260403 핵심 구조

### 4.1 왜 260403은 C++ 보충을 할 때 "완전히 같은 코드"보다 "같은 원리"를 찾아야 하는가

`260403`은 원래 블루프린트 실습 비중이 큰 날이다.
특히 `BPTestMonster`의 발사 타이머, `PlayerBullet / MonsterBullet` 태그, `Trigger Box + Level Blueprint` 조합은 교육용으로 아주 직관적이다.

다만 현재 `UE20252` C++ 소스에는 그 실습이 1:1로 복사되어 남아 있지는 않다.
대신 같은 원리가 더 실전적인 형태로 옮겨져 있다.

- 투사체 충돌: `AProjectileBase`, `AWraithBullet`
- 일반 오브젝트 충돌: `AGeometryActor`
- 오버랩 이벤트: `AItemBox`
- 실제 데미지 처리: `AMonsterBase`, `AMonsterNormal`
- 타이머 문법: `AMonsterSpawnPoint`

즉 이번 C++ 보충은 “강의와 똑같은 예제를 찾는다”기보다, 강의가 가르친 `충돌 -> 식별 -> 후속 처리 -> 시간 제어` 구조가 현재 소스에서 어떻게 성숙했는지를 읽는 장이라고 보면 된다.

### 4.2 `AProjectileBase`와 `AWraithBullet`: `Projectile Stop`, `Hit`, 충돌 프로파일이 코드에서 만나는 방식

가장 먼저 볼 것은 발사체다.
강의에서는 블루프린트 `BPBullet`의 `On Projectile Stop`을 중심으로 설명했는데, 현재 C++ 쪽 공통 베이스는 `AProjectileBase`다.

```cpp
AProjectileBase::AProjectileBase()
{
    PrimaryActorTick.bCanEverTick = true;

    // 발사체 몸통 충돌
    mBody = CreateDefaultSubobject<UBoxComponent>(TEXT("Body"));

    // 발사체 이동 규칙
    mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));

    SetRootComponent(mBody);
    mMovement->SetUpdatedComponent(mBody);

    // 발사체가 멈췄을 때 후처리 함수 호출
    mMovement->OnProjectileStop.AddDynamic(this, &AProjectileBase::ProjectileStop);
}
```

이 코드는 `260403`의 첫 핵심을 아주 그대로 보여 준다.

- 발사체는 별도 액터다.
- 충돌체와 이동 컴포넌트를 갖는다.
- 멈췄을 때 후속 처리 이벤트를 받을 수 있다.

즉 블루프린트에서 `On Projectile Stop` 노드를 끌어다 쓰던 것이, C++에서는 `AddDynamic`으로 함수에 연결된다고 이해하면 된다.

후속 실전형 탄환은 `AWraithBullet`다.

```cpp
AWraithBullet::AWraithBullet()
{
    // 플레이어 공격용 충돌 프로파일
    mBody->SetCollisionProfileName(TEXT("PlayerAttack"));

    // 충돌체가 실제 Hit 이벤트를 받을 때 처리 함수 연결
    mBody->OnComponentHit.AddDynamic(this, &AWraithBullet::BulletHit);

    mMovement->ProjectileGravityScale = 0.f;
    mMovement->InitialSpeed = 1000.f;
}
```

여기서 중요한 점은 `Projectile Stop`만 쓰는 게 아니라, 상황에 따라 `OnComponentHit`를 직접 쓰기도 한다는 것이다.
즉 현재 프로젝트는 `260403` 강의가 말한 세 충돌 입구를 이렇게 나눠 보여 준다.

- `Projectile Stop`: 발사체 이동 컴포넌트가 멈춘 시점
- `Hit`: 실제 충돌체가 부딪힌 시점
- `Overlap`: 겹침만 감지하는 시점

즉 충돌 이벤트는 하나만 있는 게 아니라, 액터 성격에 따라 가장 잘 맞는 입구를 고르는 구조라고 보면 된다.

### 4.3 `Hit Result`: 맞았다는 사실만이 아니라, 어디를 어떻게 맞았는지를 읽는 정보 묶음

강의에서 `Break Hit Result`를 배운 이유는, 충돌이 단순 불리언이 아니라 정보 꾸러미이기 때문이다.
이 점은 현재 C++에서도 아주 선명하다.

예를 들어 `AWraithBullet::BulletHit()`는 충돌 위치를 그대로 이펙트와 사운드, 데칼에 사용한다.

```cpp
void AWraithBullet::BulletHit(UPrimitiveComponent* HitComponent, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
    Destroy();

    if (IsValid(mHitParticle))
        UGameplayStatics::SpawnEmitterAtLocation(GetWorld(), mHitParticle, Hit.ImpactPoint);

    if (IsValid(mHitSound))
        UGameplayStatics::SpawnSoundAtLocation(GetWorld(), mHitSound, Hit.ImpactPoint);

    if (IsValid(mHitDecal))
    {
        UGameplayStatics::SpawnDecalAtLocation(
            GetWorld(), mHitDecal,
            FVector(20.0, 20.0, 10.0),
            Hit.ImpactPoint,
            (-Hit.ImpactNormal).Rotation(),
            5.f
        );
    }
}
```

초보자용으로 풀면 이렇다.

- `ImpactPoint`: 어디에 맞았는가
- `ImpactNormal`: 표면이 어느 방향을 보고 있었는가

그래서 충돌 후 “이펙트를 어디에 띄울지”, “데칼을 어느 방향으로 붙일지”를 계산할 수 있다.
즉 `Hit Result`는 충돌 이후 연출의 출발점이다.

일반 오브젝트 충돌도 같은 원리를 쓴다.
`AGeometryActor`는 `Hit Result`를 이용해 정확히 맞은 조각과 파괴 위치를 계산한다.

```cpp
void AGeometryActor::GeometryHit(UPrimitiveComponent* HitComponent, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
    int32 ItemIndex = 0;

    if (Hit.Item != -1)
        ItemIndex = Hit.Item;

    mGeometry->ApplyExternalStrain(
        ItemIndex,        // 맞은 조각 인덱스
        Hit.ImpactPoint,  // 충돌 위치
        50.f,
        1,
        1.f,
        1500000.f
    );
}
```

즉 `260403`에서 배운 `Break Hit Result`는 이후 파괴 연출, 데칼, 히트 이펙트까지 이어지는 아주 기본적인 읽기 도구다.

### 4.4 태그, 충돌 프로파일, 팀 ID, `TakeDamage`: 소속 구분이 프로젝트 안에서 어떻게 성장하는가

강의의 블루프린트 실습은 `PlayerBullet`, `MonsterBullet` 태그를 붙여 “누가 쏜 탄환인가”를 구분했다.
이 방식은 지금도 좋은 입문법이다.

실제로 현재 C++에도 그 흔적이 주석으로 남아 있다.

```cpp
// TObjectPtr<ATestBullet> Bullet =
//     GetWorld()->SpawnActor<ATestBullet>(SpawnLoc, GetActorRotation(), param);
//
// Bullet->SetLifeSpan(5.f);
// Bullet->Tags.Add(TEXT("PlayerBullet"));
```

즉 태그 방식은 실제 프로젝트가 한때 분명히 지나간 설계다.

다만 현재 소스는 한 단계 더 나아가, 태그만으로 구분하지 않고 충돌 프로파일과 팀 ID, `TakeDamage()` 흐름을 함께 쓴다.
플레이어와 몬스터는 생성자에서부터 서로 다른 충돌 프로파일과 팀을 가진다.

```cpp
// 플레이어
GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
SetGenericTeamId(FGenericTeamId(TeamPlayer));

// 몬스터
mBody->SetCollisionProfileName(TEXT("Monster"));
SetGenericTeamId(FGenericTeamId(TeamMonster));

// 플레이어 발사체
mBody->SetCollisionProfileName(TEXT("PlayerAttack"));
```

그리고 실제 데미지는 `TakeDamage()`로 넘긴다.

```cpp
// 플레이어 공격이 몬스터에게 전달될 때
FDamageEvent DmgEvent;
Target->TakeDamage(mAttack, DmgEvent, GetController(), this);
```

몬스터 쪽은 이 값을 실제 체력 변화로 바꾼다.

```cpp
float AMonsterBase::TakeDamage(float DamageAmount, const FDamageEvent& DamageEvent,
    AController* EventInstigator, AActor* DamageCauser)
{
    float Dmg = Super::TakeDamage(DamageAmount, DamageEvent, EventInstigator, DamageCauser);

    Dmg -= mDefense;
    if (Dmg < 1.f)
        Dmg = 1.f;

    mHP -= Dmg;
    return Dmg;
}
```

즉 흐름을 비교하면 이렇게 된다.

- `260403` 입문 실습: 태그로 소속 구분
- 현재 C++ 구조: 충돌 프로파일 + 팀 ID + `TakeDamage()`로 더 정교하게 구분

이 말은 태그가 틀렸다는 뜻이 아니다.
오히려 태그는 가장 싼 비용으로 규칙을 이해하기 좋은 출발점이고, 프로젝트가 커지면 그것이 더 체계적인 충돌 규칙으로 발전한다고 보는 편이 맞다.

### 4.5 `Overlap`과 트리거: `Level Blueprint` 실습은 나중에 액터 내부 이벤트로 옮겨 간다

강의의 `Trigger Box + Level Blueprint` 실습은 현재 C++ 소스에 그대로 남아 있지 않다.
하지만 같은 원리는 `AItemBox` 같은 액터 내부 오버랩 처리로 살아 있다.

```cpp
AItemBox::AItemBox()
{
    mBody = CreateDefaultSubobject<UBoxComponent>(TEXT("Body"));
    mMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));

    SetRootComponent(mBody);
    mMesh->SetupAttachment(mBody);

    mMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    mBody->SetCollisionProfileName(TEXT("ItemBox"));

    // 오버랩 이벤트 연결
    mBody->OnComponentBeginOverlap.AddDynamic(this, &AItemBox::ItemOverlap);
}

void AItemBox::ItemOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
    const FHitResult& SweepResult)
{
    Destroy();
}
```

이 코드는 `260403`의 트리거 강의를 이렇게 다시 보여 준다.

- `Block`이 아니라 `Overlap`을 받는 충돌체를 만든다.
- 누군가 겹치면 이벤트가 들어온다.
- 그 이벤트를 계기로 후속 동작을 실행한다.

즉 `Trigger Box` 실습의 본질은 “보이지 않는 오버랩 영역이 이벤트를 시작한다”는 것이고, 현재 프로젝트는 그 책임을 `Level Blueprint` 대신 각 액터 내부로 옮긴 상태라고 보면 된다.

그래서 성장 흐름은 대체로 이렇게 읽으면 된다.

- 입문 단계: `Level Blueprint`에서 빠르게 연결
- 확장 단계: 액터 내부 `OnComponentBeginOverlap`로 캡슐화

즉 `260403`의 트리거 강의는 버려지는 예제가 아니라, 이후 오브젝트 지향적으로 정리될 이벤트 구조의 첫 버전이다.

### 4.6 C++ 타이머 문법: 정확한 몬스터 발사 예제는 BP 덤프에 있고, 소스에는 타이머 API가 남아 있다

강의의 정확한 `Set Timer by Event -> Fire` 반복 발사 예제는 현재 `BPTestMonster` 덤프에 가장 또렷하게 남아 있다.
즉 “1초마다 총알을 쏜다”는 그 교육용 예제 자체는 C++ 파일로 직접 옮겨져 있지 않다.

다만 현재 소스에도 같은 타이머 API 문법은 분명히 남아 있다.
예를 들어 `AMonsterSpawnPoint`는 일정 시간이 지난 뒤 다시 몬스터를 생성할 때 `SetTimer`를 쓴다.

```cpp
void ClearSpawn()
{
    if (mSpawnTime > 0.f)
    {
        // mSpawnTime 뒤에 SpawnTimerFinish 함수를 한 번 호출
        GetWorldTimerManager().SetTimer(
            mSpawnTimer,
            this,
            &AMonsterSpawnPoint::SpawnTimerFinish,
            mSpawnTime,
            false
        );
    }
    else
    {
        SpawnMonster();
    }
}
```

초보자용으로 풀면 이렇다.

- `SetTimer`: 일정 시간 뒤 함수를 호출해 달라고 예약한다.
- 마지막 `false`: 반복이 아니라 한 번만 실행한다.
- 반복으로 쓰고 싶다면 여기 값을 바꾸거나 다른 설정을 사용하면 된다.

즉 강의의 `Set Timer by Event`는 블루프린트용 표현이고, C++에선 `GetWorldTimerManager().SetTimer(...)`가 거의 같은 역할을 한다고 이해하면 된다.
다만 현재 저장소에서 “몬스터가 1초마다 탄환을 쏜다”는 정확한 예시는 여전히 `BPTestMonster` 덤프 쪽이 더 직접적이고, C++ 소스는 그 문법이 다른 시스템으로 확장된 상태라고 보는 편이 맞다.

### 4.7 장 정리

제4장의 결론은 `260403`의 핵심 개념이 현재 C++ 프로젝트에서도 분명히 살아 있다는 점이다.

- `AProjectileBase`, `AWraithBullet`: `Projectile Stop`, `Hit`, 충돌 프로파일
- `AGeometryActor`: `Hit Result` 기반 후속 처리
- `AMonsterBase`, `AMonsterNormal`: `TakeDamage()`와 실제 체력 감소
- `AItemBox`: `Overlap` 이벤트의 액터 내부 캡슐화
- `AMonsterSpawnPoint`: 타이머 API의 C++ 문법

즉 `260403`은 블루프린트 입문 장이면서 동시에, 이후 충돌 규칙과 전투 판정, 트리거 이벤트가 모두 자라나는 공통 뿌리다.

---

## 전체 정리

`260403`은 전투 시스템을 화려하게 만드는 날이 아니다.
오히려 그보다 더 앞단에서, 이벤트가 언제 시작되고, 누구에게 적용되며, 어떤 규칙으로 반응할지를 세우는 날이다.
그리고 이번 정리본에서는 여기에 더해, 그 구조가 현재 `UE20252` C++ 소스에서 `ProjectileBase`, `WraithBullet`, `GeometryActor`, `ItemBox`, `MonsterBase` 같은 클래스로 어떻게 정리되었는지도 함께 읽는다.

세 파트는 각각 다른 주제처럼 보이지만 실제로는 한 줄기로 이어진다.

- 충돌은 이벤트를 발생시킨다.
- 태그는 그 이벤트의 대상 소속을 식별한다.
- 트리거는 충돌 기반 이벤트를 맵 기믹으로 확장한다.

이 날짜를 이해하고 나면, 이후의 데미지 시스템, AI 판정, 스킬 충돌, 함정, 맵 연출이 왜 모두 비슷한 사고방식으로 설계되는지도 보이기 시작한다.

## 복습 체크리스트

- `Block`, `Overlap`, `Ignore`의 차이를 예시와 함께 설명할 수 있는가?
- `Projectile Stop`과 일반 `Hit` 이벤트를 구분할 수 있는가?
- `Hit Result`에서 어떤 정보를 꺼내 쓸 수 있는지 알고 있는가?
- `Set Timer by Event`와 `Fire` 이벤트의 역할을 분리해서 설명할 수 있는가?
- `PlayerBullet`, `MonsterBullet` 같은 태그가 왜 필요한지 설명할 수 있는가?
- `Begin Overlap`과 `End Overlap`이 각각 어떤 상황에서 쓰이는지 알고 있는가?
- `Trigger Box`를 `Block`보다 `Overlap`으로 쓰는 이유를 말할 수 있는가?
- `Projectile Stop`, `Hit`, `Overlap`, `TakeDamage`, `SetTimer`가 현재 C++ 소스에서 각각 어디에 등장하는지 설명할 수 있는가?

## 세미나 질문

1. 충돌 자체와 데미지 판정을 분리해서 생각해야 하는 이유는 무엇인가?
2. 태그 기반 식별 방식은 빠르고 간단하지만, 프로젝트가 커질수록 어떤 한계가 생길 수 있을까?
3. `Level Blueprint` 실습이 교육용으로는 좋은데, 실제 프로젝트에서는 액터 내부 로직으로 이동하는 이유는 무엇일까?
4. 태그 기반 판정이 현재 프로젝트에서 충돌 프로파일과 팀 ID, `TakeDamage()` 구조로 발전한 이유는 무엇일까?

## 권장 과제

1. 발사체가 벽에 맞으면 즉시 사라지는 구조를 기준으로, 여기에 히트 이펙트 하나를 추가하려면 어떤 정보가 더 필요한지 적어 본다.
2. `PlayerBullet`, `MonsterBullet` 태그 외에 `Trap`, `BossSkill`, `NeutralObject` 같은 태그가 생긴다고 가정하고, 어떤 규칙 충돌이 발생할 수 있는지 정리해 본다.
3. `Trigger Box` 하나를 이용해 "플레이어가 들어오면 돌이 떨어지고, 나가면 다시 원위치로 복구되는 장치"를 어떻게 구성할지 `Begin Overlap`과 `End Overlap` 기준으로 설계해 본다.
4. `AProjectileBase`, `AWraithBullet`, `AItemBox`를 보고 각각이 왜 `Projectile Stop`, `Hit`, `Overlap` 중 다른 입구를 선택했는지 스스로 비교해 본다.
