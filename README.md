# Rusana: Shadow

Новая игра на основе технических идей из ballbuster-empire, но с отдельным кодом и отдельным репозиторием.

## Первый vertical slice

- свободный combat input;
- melee hit resolution по дистанции и углу;
- stamina, hit reaction, knockdown;
- stealth movement;
- NPC vision / alert;
- переход stealth -> alert -> combat;
- процедурные персонажи как временная база для дальнейшей замены на полноценные GLB-модели;
- Three.js renderer, shadows, fog, bloom.

## Следующий этап

1. заменить процедурные модели на улучшенные GLB;
2. вынести combat/stealth/AI в независимые модули;
3. добавить полноценную locomotion + animation state machine;
4. perception: зрение, слух, шум, укрытия;
5. takedown/stealth attacks;
6. несколько типов врагов;
7. progression и сохранения.

Исходный ballbuster-empire не изменяется.