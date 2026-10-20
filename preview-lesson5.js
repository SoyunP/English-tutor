/* Lesson 5 · Topic 3 — From the Self-Portrait to the Selfie */
(function () {
  const DEFAULT_PARAGRAPHS = [
    {
      id: "p1",
      title: "문단 1 · 셀피와 자화상",
      summaryKo:
        "오늘날 사람들은 셀피로 특별한 순간을 담는다. 오래전에는 사람들이 다른 방식, 즉 자기 모습을 직접 그려서 남겼는데 이것이 자화상이다.",
      en: "Today, people enjoy taking selfies. We can capture special moments with them.\n\nLong ago, people captured their own image in a different way. They painted pictures of themselves. These pictures are self-portraits.",
      ko: "",
    },
    {
      id: "p2",
      title: "문단 2 · 셀피와 자화상의 공통점",
      summaryKo:
        "셀피와 자화상은 둘 다 특정한 시점의 우리 모습을 보여 주어 일기처럼 그때를 기억하게 해 준다. 우리는 행복한 순간을 기억하려고 셀피를 찍고, 렘브란트는 거울을 보며 평생 약 90점의 자화상을 그려 젊은 시절부터 노년까지의 얼굴을 남겼다.",
      en: "Selfies and self-portraits are similar. Both show our image at a certain time. When we look at them, we can remember ourselves from that time. They are like a diary.\n\nWe take selfies to remember happy moments. Selfies capture the expressions on our faces at those times. We often look at selfies with our family and friends to bring back those joyful feelings.\n\nSimilarly, some painters made self-portraits to capture different times in their lives. Rembrandt looked in the mirror and painted himself many times. He painted around 90 self-portraits in his life. They show his face from youth to old age.",
      ko: "",
    },
    {
      id: "p3",
      title: "문단 3 · 셀피와 자화상의 차이점",
      summaryKo:
        "셀피는 카메라로 언제든 빠르게 찍을 수 있지만, 자화상은 시간이 걸리고 화가의 개인적인 화풍을 보여 준다. 반 고흐는 모델을 구할 돈이 부족해 자기 자신을 그렸고, 밝은 색과 많은 물감을 쓴 방식이 그만의 독특한 스타일이 되었다. 우리도 셀피와 자화상으로 자신을 표현할 수 있다.",
      en: "Selfies and self-portraits also have differences. Taking a selfie is easy. We can do it quickly with our camera at any time. However, painting a self-portrait takes some time. Also, a self-portrait shows a painter's personal painting style.\n\nTo paint a person, a painter needs a model. Vincent van Gogh didn't have enough money for a model. So he painted himself! When he painted his self-portraits, he chose bright colors and applied a lot of paint. This became his unique style. We can see it in his other paintings too.\n\nWe can express ourselves with selfies and self-portraits. Do you want to try?",
      ko: "",
    },
  ];

  const VOCAB = [
    { word: "selfie", pos: "n.", ko: "셀피, 자기 모습을 찍은 사진", ex: "Let's take a selfie in front of the tower.", exKo: "탑 앞에서 셀피를 찍자." },
    { word: "self-portrait", pos: "n.", ko: "자화상", forms: ["self-portraits"], ex: "The artist hung her self-portrait on the wall.", exKo: "그 화가는 자신의 자화상을 벽에 걸었다." },
    { word: "capture", pos: "v.", ko: "(사진·그림 등으로) 담다, 포착하다", forms: ["captured", "captures"], ex: "He captured the sunset with his phone.", exKo: "그는 휴대폰으로 노을을 담았다." },
    { word: "moment", pos: "n.", ko: "순간", forms: ["moments"], ex: "That was the best moment of my trip.", exKo: "그것은 내 여행 최고의 순간이었다." },
    { word: "image", pos: "n.", ko: "모습, 이미지", ex: "I saw my image in the window.", exKo: "나는 창문에 비친 내 모습을 보았다." },
    { word: "long ago", pos: "phr.", ko: "오래전에", ex: "Long ago, people wrote letters by hand.", exKo: "오래전에 사람들은 손으로 편지를 썼다." },
    { word: "in a different way", pos: "phr.", ko: "다른 방식으로", ex: "Try to solve the problem in a different way.", exKo: "그 문제를 다른 방식으로 풀어 봐." },
    { word: "similar", pos: "adj.", ko: "비슷한", ex: "My bag is similar to yours.", exKo: "내 가방은 네 것과 비슷하다." },
    { word: "certain", pos: "adj.", ko: "특정한, 어떤", ex: "The shop opens at a certain time every day.", exKo: "그 가게는 매일 정해진 시간에 문을 연다." },
    { word: "diary", pos: "n.", ko: "일기", ex: "I write in my diary before bed.", exKo: "나는 자기 전에 일기를 쓴다." },
    { word: "expression", pos: "n.", ko: "표정; 표현", forms: ["expressions"], ex: "Her expression changed when she heard the news.", exKo: "그 소식을 듣자 그녀의 표정이 바뀌었다." },
    { word: "joyful", pos: "adj.", ko: "기쁜, 즐거운", ex: "The festival was full of joyful music.", exKo: "축제는 즐거운 음악으로 가득했다." },
    { word: "bring back", pos: "phr.", ko: "(기억·감정을) 되살리다, 떠올리게 하다", ex: "This song brings back my childhood.", exKo: "이 노래는 내 어린 시절을 떠올리게 한다." },
    { word: "similarly", pos: "adv.", ko: "비슷하게, 마찬가지로", ex: "Similarly, my brother loves soccer.", exKo: "마찬가지로, 내 남동생도 축구를 아주 좋아한다." },
    { word: "mirror", pos: "n.", ko: "거울", ex: "She checked her hair in the mirror.", exKo: "그녀는 거울을 보며 머리를 확인했다." },
    { word: "around", pos: "adv.", ko: "약, ~쯤", ex: "Around 30 students joined the club.", exKo: "약 30명의 학생이 동아리에 가입했다." },
    { word: "youth", pos: "n.", ko: "젊은 시절, 청춘", ex: "My grandfather played baseball in his youth.", exKo: "할아버지는 젊은 시절에 야구를 하셨다." },
    { word: "old age", pos: "phr.", ko: "노년", ex: "He kept painting until old age.", exKo: "그는 노년까지 계속 그림을 그렸다." },
    { word: "difference", pos: "n.", ko: "차이점", forms: ["differences"], ex: "Can you find the difference between the two pictures?", exKo: "두 그림의 차이점을 찾을 수 있니?" },
    { word: "quickly", pos: "adv.", ko: "빨리, 신속하게", ex: "He finished his homework quickly.", exKo: "그는 숙제를 빨리 끝냈다." },
    { word: "take time", pos: "phr.", ko: "시간이 걸리다", forms: ["takes some time", "takes time"], ex: "Learning a new language takes time.", exKo: "새로운 언어를 배우는 것은 시간이 걸린다." },
    { word: "however", pos: "adv.", ko: "하지만, 그러나", ex: "It was cold. However, we went swimming.", exKo: "추웠다. 하지만 우리는 수영하러 갔다." },
    { word: "personal", pos: "adj.", ko: "개인의, 개인적인", ex: "This is my personal opinion.", exKo: "이것은 나의 개인적인 의견이다." },
    { word: "style", pos: "n.", ko: "스타일, 방식, 화풍", ex: "I like the style of her drawings.", exKo: "나는 그녀 그림의 스타일이 좋다." },
    { word: "model", pos: "n.", ko: "모델", ex: "My sister was the model for my drawing.", exKo: "내 여동생이 내 그림의 모델이 되어 주었다." },
    { word: "enough", pos: "adj.", ko: "충분한", ex: "We don't have enough chairs for everyone.", exKo: "모두가 앉을 만큼 의자가 충분하지 않다." },
    { word: "choose", pos: "v.", ko: "고르다, 선택하다 (과거형 chose)", forms: ["chose", "chosen"], ex: "She chose a blue dress for the party.", exKo: "그녀는 파티를 위해 파란 드레스를 골랐다." },
    { word: "apply", pos: "v.", ko: "(물감·크림 등을) 바르다, 칠하다 (과거형 applied)", forms: ["applied", "applies"], ex: "He applied sunscreen before going out.", exKo: "그는 외출 전에 선크림을 발랐다." },
    { word: "unique", pos: "adj.", ko: "독특한, 고유한", ex: "Every person has a unique voice.", exKo: "모든 사람은 고유한 목소리를 가지고 있다." },
    { word: "express", pos: "v.", ko: "표현하다", ex: "Music helps me express my feelings.", exKo: "음악은 내가 감정을 표현하도록 도와준다." },
    { word: "painter", pos: "n.", ko: "화가", forms: ["painters"], ex: "The painter worked in a small studio.", exKo: "그 화가는 작은 작업실에서 일했다." },
    { word: "a lot of", pos: "phr.", ko: "많은", ex: "There were a lot of people at the concert.", exKo: "콘서트에는 많은 사람이 있었다." },
  ];

  const GRAMMAR = [
    {
      title: "① 동명사 (V-ing) — enjoy의 목적어 / 문장의 주어",
      body: "동사에 -ing를 붙이면 '~하는 것'이라는 명사처럼 쓸 수 있어요. enjoy는 뒤에 to부정사가 아니라 동명사를 목적어로 써요. 동명사가 주어일 때는 단수 취급해서 동사도 단수형(is, takes)을 써요.",
      inText: ["enjoy taking selfies", "Taking a selfie is easy", "painting a self-portrait takes some time"],
      examples: [
        { ok: "I enjoy drawing cartoons.", ng: "I enjoy to draw cartoons." },
        { ok: "Reading comics is fun.", ng: "Reading comics are fun." },
      ],
      tip: "시험 포인트: enjoy / finish / stop + V-ing, 동명사 주어 + 단수 동사",
    },
    {
      title: "② to부정사 부사적 용법 — 목적 '~하기 위해'",
      body: "to + 동사원형이 문장에서 '왜 그 행동을 했는지(목적)'를 나타내면 '~하기 위해'로 해석해요. 문장 맨 앞에 와서 쉼표(,)와 함께 쓰이기도 해요.",
      inText: ["take selfies to remember happy moments", "look at selfies ... to bring back those joyful feelings", "made self-portraits to capture different times", "To paint a person, a painter needs a model"],
      examples: [
        { ok: "She went to the library to borrow a book.", ng: "She went to the library for borrow a book." },
        { ok: "To win the race, he practiced every day." },
      ],
      tip: "to 뒤에는 반드시 동사원형! (to remembering ✗)",
    },
    {
      title: "③ to부정사 명사적 용법 — want의 목적어 '~하는 것을'",
      body: "want, hope, plan, decide 같은 동사 뒤의 to부정사는 '~하는 것을'이라는 목적어 역할을 해요. ②의 '~하기 위해'와 구별하는 문제가 자주 나와요.",
      inText: ["Do you want to try?"],
      examples: [
        { ok: "I want to learn Chinese. (중국어 배우는 것을 원한다)" },
        { ok: "He went out to buy milk. (우유를 사기 위해 → 부사적 용법)" },
      ],
      tip: "구별법: '~하기 위해'로 해석되면 부사적, '~하는 것을'로 해석되면 명사적",
    },
    {
      title: "④ 재귀대명사 — 주어와 목적어가 같을 때",
      body: "주어가 한 행동의 대상이 주어 자신일 때 -self / -selves 형태를 써요. people → themselves, we → ourselves, he → himself.",
      inText: ["painted pictures of themselves", "remember ourselves from that time", "painted himself many times", "So he painted himself!", "express ourselves"],
      examples: [
        { ok: "Rembrandt painted himself.", ng: "Rembrandt painted him. (다른 남자를 그렸다는 뜻이 됨)" },
        { ok: "We introduced ourselves to the class." },
      ],
      tip: "I-myself, you-yourself, he-himself, she-herself, it-itself, we-ourselves, they-themselves",
    },
    {
      title: "⑤ 조동사 can + 동사원형",
      body: "can은 '~할 수 있다'라는 능력·가능을 나타내요. can 뒤에는 항상 동사원형이 와요.",
      inText: ["We can capture special moments", "we can remember ourselves", "We can do it quickly", "We can see it", "We can express ourselves"],
      examples: [{ ok: "She can play the piano.", ng: "She can plays the piano." }],
      tip: "주어가 3인칭 단수여도 can 뒤에 -s를 붙이지 않아요.",
    },
    {
      title: "⑥ 과거시제 — 규칙 / 불규칙 / 부정",
      body: "규칙 동사는 -ed를 붙이고(captured, painted, looked), '자음+y'로 끝나면 y를 i로 바꿔 -ied를 붙여요(apply → applied). 불규칙 동사는 따로 외워야 해요(make → made, choose → chose, become → became). 과거 부정은 didn't + 동사원형이에요.",
      inText: ["captured their own image", "made self-portraits", "he chose bright colors", "applied a lot of paint", "This became his unique style", "didn't have enough money"],
      examples: [
        { ok: "He chose the red one.", ng: "He choosed the red one." },
        { ok: "She didn't have time.", ng: "She didn't had time." },
      ],
      tip: "choose-chose-chosen, become-became-become, make-made-made",
    },
    {
      title: "⑦ 접속사 when '~할 때'",
      body: "when + 주어 + 동사는 '~할 때'라는 시간을 나타내요. 문장 앞에 오면 쉼표(,)로 구분해요.",
      inText: ["When we look at them, we can remember ...", "When he painted his self-portraits, he chose ..."],
      examples: [{ ok: "When I was young, I lived in Busan." }],
      tip: "when절이 앞에 오면 쉼표, 뒤에 오면 쉼표 없이",
    },
    {
      title: "⑧ 꼭 외울 표현",
      body: "like a diary(일기와 같은) · at a certain time(특정한 시간에) · at any time(언제든지) · from youth to old age(젊은 시절부터 노년까지: from A to B) · around 90(약 90) · take time(시간이 걸리다) · enough money for a model(모델을 위한 충분한 돈: enough + 명사) · bring back(되살리다) · a lot of(많은) · in a different way(다른 방식으로)",
      inText: [],
      examples: [],
      tip: "대명사가 가리키는 말: them = selfies / They(공통점 문단) = selfies and self-portraits / it = his unique style",
    },
  ];

  const ANALYSIS = [
    {
      parts: [["People", "주어"], ["enjoy", "동사"], ["taking selfies", "목적어 (동명사구)"]],
      ko: "사람들은 셀피 찍는 것을 즐긴다.",
      note: "enjoy + V-ing",
    },
    {
      parts: [["They", "주어 (= people)"], ["painted", "동사 (과거)"], ["pictures of themselves", "목적어 + 재귀대명사"]],
      ko: "그들은 자기 자신의 그림을 그렸다.",
      note: "themselves = 주어 They 자신",
    },
    {
      parts: [["Both", "주어 (= 셀피와 자화상)"], ["show", "동사"], ["our image", "목적어"], ["at a certain time", "시간 (부사구)"]],
      ko: "둘 다 특정한 시점의 우리 모습을 보여 준다.",
      note: "Both가 주어일 때 복수 동사 show",
    },
    {
      parts: [["We", "주어"], ["take", "동사"], ["selfies", "목적어"], ["to remember happy moments", "목적 (to부정사 부사적 용법)"]],
      ko: "우리는 행복한 순간을 기억하기 위해 셀피를 찍는다.",
      note: "to remember = ~을 기억하기 위해",
    },
    {
      parts: [["Rembrandt", "주어"], ["looked in the mirror", "동사 1 + 부사구"], ["and", "접속사"], ["painted himself", "동사 2 + 재귀대명사"]],
      ko: "렘브란트는 거울을 보고 자기 자신을 그렸다.",
      note: "and로 과거 동사 두 개가 나란히 (병렬)",
    },
    {
      parts: [["Taking a selfie", "주어 (동명사구)"], ["is", "동사 (단수)"], ["easy", "보어"]],
      ko: "셀피를 찍는 것은 쉽다.",
      note: "동명사 주어 → 단수 동사 is",
    },
    {
      parts: [["painting a self-portrait", "주어 (동명사구)"], ["takes", "동사 (단수)"], ["some time", "목적어"]],
      ko: "자화상을 그리는 것은 시간이 좀 걸린다.",
      note: "take time = 시간이 걸리다",
    },
    {
      parts: [["Vincent van Gogh", "주어"], ["didn't have", "동사 (과거 부정)"], ["enough money", "목적어 (enough + 명사)"], ["for a model", "전치사구"]],
      ko: "빈센트 반 고흐는 모델을 위한 충분한 돈이 없었다.",
      note: "didn't + 동사원형 (didn't had ✗)",
    },
    {
      parts: [["This", "주어 (= 밝은 색과 많은 물감을 쓴 것)"], ["became", "동사 (become 과거)"], ["his unique style", "보어"]],
      ko: "이것이 그의 독특한 스타일이 되었다.",
      note: "become + 명사 = ~이 되다",
    },
    {
      parts: [["Do", "조동사 (의문문)"], ["you", "주어"], ["want", "동사"], ["to try", "목적어 (to부정사 명사적 용법)"]],
      ko: "너도 해 보고 싶니?",
      note: "want to = ~하는 것을 원하다",
    },
  ];

  const QUESTIONS = [
    {
      id: "c1", points: 4,
      prompt: "다음 글의 주제로 가장 적절한 것은?",
      options: ["셀피를 잘 찍는 방법", "셀피와 자화상의 공통점과 차이점", "렘브란트의 일생", "반 고흐가 가난했던 이유", "카메라의 발전 과정"],
      answer: 1,
      explain: "글은 셀피와 자화상을 소개한 뒤 공통점(특정 시점의 모습을 보여 줌)과 차이점(걸리는 시간, 화가의 개인 스타일)을 설명하므로 ②가 주제예요.",
    },
    {
      id: "c2", points: 4,
      prompt: "다음 글의 내용과 일치하지 않는 것은?",
      options: [
        "오래전 사람들은 자기 모습을 그림으로 남겼다.",
        "셀피와 자화상은 둘 다 특정 시점의 모습을 보여 준다.",
        "렘브란트는 평생 약 90점의 자화상을 그렸다.",
        "자화상을 그리는 것은 셀피를 찍는 것보다 빠르다.",
        "반 고흐는 자화상에 밝은 색을 사용했다.",
      ],
      answer: 3,
      explain: "본문에서 셀피는 카메라로 빠르게 찍을 수 있고, 자화상은 시간이 걸린다(takes some time)고 했어요. 그래서 ④가 일치하지 않아요.",
    },
    {
      id: "c3", points: 4,
      prompt: "셀피와 자화상의 공통점으로 본문에 언급된 것은?",
      options: ["특정한 시점의 우리 모습을 보여 준다.", "카메라가 꼭 필요하다.", "완성하는 데 오래 걸린다.", "화가의 개인적인 화풍을 보여 준다.", "반드시 모델이 필요하다."],
      answer: 0,
      explain: "'Both show our image at a certain time.'이 공통점이에요. ③④는 자화상만의 특징(차이점)이에요.",
    },
    {
      id: "c4", points: 4,
      prompt: "글쓴이가 셀피와 자화상을 무엇에 비유했는지 고르시오.",
      options: ["거울", "일기", "사진첩", "편지", "영화"],
      answer: 1,
      explain: "'They are like a diary.'에서 like는 '~와 같은'이라는 뜻의 전치사예요. 둘 다 그때의 나를 기억하게 해 주므로 일기(diary)에 비유했어요.",
    },
    {
      id: "c5", points: 4,
      prompt: "렘브란트의 자화상들이 보여 주는 것으로 가장 적절한 것은?",
      options: ["그의 가족들의 모습", "젊은 시절부터 노년까지의 그의 얼굴", "그가 여행한 장소들", "친구들의 다양한 표정", "그가 좋아한 풍경"],
      answer: 1,
      explain: "'They show his face from youth to old age.' — from A to B는 'A부터 B까지'예요. 사진 속 나이(23, 28, 34, 53, 63세)도 이를 보여 줘요.",
    },
    {
      id: "c6", points: 4,
      prompt: "반 고흐가 자기 자신을 그린 이유로 가장 적절한 것은?",
      options: ["거울 보는 것을 좋아해서", "모델을 구할 돈이 충분하지 않아서", "유명해지고 싶어서", "선생님이 시켜서", "카메라가 고장 나서"],
      answer: 1,
      explain: "'Vincent van Gogh didn't have enough money for a model. So he painted himself!' — 모델에게 줄 돈이 부족해서 자신을 그렸어요.",
    },
    {
      id: "c7", points: 4,
      prompt: "반 고흐 자화상의 특징으로 본문에 언급된 것은?",
      options: ["어두운 색과 얇은 붓질", "밝은 색과 많은 양의 물감", "흑백으로만 그린 그림", "연필로만 그린 스케치", "사진처럼 정확한 묘사"],
      answer: 1,
      explain: "'he chose bright colors and applied a lot of paint' — 밝은 색을 고르고 물감을 많이 발랐고, 이것이 그의 독특한 스타일이 되었어요.",
    },
    {
      id: "c8", points: 4,
      prompt: "다음 문장의 밑줄 친 them이 가리키는 것은?",
      quote: "We can capture special moments with <u>them</u>.",
      options: ["people", "selfies", "moments", "self-portraits", "painters"],
      answer: 1,
      explain: "바로 앞 문장의 selfies(셀피)를 가리켜요. '우리는 셀피로 특별한 순간을 담을 수 있다'라는 뜻이에요.",
    },
    {
      id: "c9", points: 4,
      prompt: "다음 문장의 밑줄 친 it이 가리키는 것은?",
      quote: "We can see <u>it</u> in his other paintings too.",
      options: ["a model", "his money", "his unique style", "the mirror", "a selfie"],
      answer: 2,
      explain: "앞 문장 'This became his unique style.'의 his unique style(그의 독특한 스타일)을 가리켜요.",
    },
    {
      id: "c10", points: 5,
      prompt: "다음 중 밑줄 친 to부정사의 쓰임이 나머지와 다른 것은?",
      options: [
        "We take selfies <u>to remember</u> happy moments.",
        "Some painters made self-portraits <u>to capture</u> different times.",
        "<u>To paint</u> a person, a painter needs a model.",
        "Do you want <u>to try</u>?",
        "I went to the park <u>to take</u> pictures.",
      ],
      answer: 3,
      explain: "①②③⑤는 '~하기 위해'(목적, 부사적 용법)이고, ④는 want의 목적어로 '~하는 것을'(명사적 용법)이에요.",
    },
    {
      id: "c11", points: 4,
      prompt: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
      quote: "Rembrandt looked in the mirror and painted ________.",
      options: ["him", "his", "himself", "herself", "themselves"],
      answer: 2,
      explain: "주어 Rembrandt(남성 단수)가 자기 자신을 그렸으므로 재귀대명사 himself를 써요. him을 쓰면 다른 남자를 그렸다는 뜻이 돼요.",
    },
    {
      id: "c12", points: 5,
      prompt: "다음 중 어법상 옳지 않은 문장은?",
      options: [
        "Taking a selfie is easy.",
        "Painting a self-portrait takes some time.",
        "Van Gogh choosed bright colors.",
        "He applied a lot of paint.",
        "He didn't have enough money.",
      ],
      answer: 2,
      explain: "choose의 과거형은 불규칙 변화 chose예요. choosed는 틀린 형태예요.",
    },
    {
      id: "c13", points: 4,
      prompt: "셀피와 자화상의 차이점으로 본문에 언급되지 않은 것은?",
      options: [
        "셀피는 빠르게 찍을 수 있다.",
        "셀피는 언제든지 찍을 수 있다.",
        "자화상은 그리는 데 시간이 걸린다.",
        "자화상은 화가의 개인적인 화풍을 보여 준다.",
        "자화상은 특정 시점의 모습을 보여 준다.",
      ],
      answer: 4,
      explain: "특정 시점의 모습을 보여 주는 것은 셀피와 자화상의 공통점이에요(Both show ...). 차이점이 아니에요.",
    },
    {
      id: "c14", points: 5, type: "short",
      prompt: "괄호 안의 단어를 어법에 맞게 바꾸어 쓰시오.",
      quote: "When he painted his self-portraits, he (choose) bright colors.",
      accepted: ["chose"],
      modelAnswer: "chose",
      explain: "과거 이야기이므로 choose의 과거형 chose를 써요. (choose - chose - chosen)",
    },
    {
      id: "c15", points: 6, type: "short",
      prompt: "다음 우리말과 일치하도록 주어진 단어를 모두 배열하여 문장을 완성하시오.",
      quote: "우리는 셀피와 자화상으로 우리 자신을 표현할 수 있다.\n[ express / we / ourselves / can ] with selfies and self-portraits.",
      accepted: ["we can express ourselves", "we can express ourselves with selfies and self-portraits"],
      modelAnswer: "We can express ourselves with selfies and self-portraits.",
      explain: "주어(We) + 조동사(can) + 동사원형(express) + 재귀대명사 목적어(ourselves) 순서예요.",
    },
  ];

  window.LESSON_DATA = window.LESSON_DATA || {};
  window.LESSON_DATA.l5 = {
    lessonNo: 5,
    lessonTitle: "Enjoying Art",
    title: "From the Self-Portrait to the Selfie",
    titleKo: "자화상에서 자가 촬영까지 — 자화상과 셀피의 공통점과 차이점을 설명하는 글",
    storageKey: "englishlab.lesson5.topic3",
    paragraphs: DEFAULT_PARAGRAPHS,
    vocab: VOCAB,
    grammar: GRAMMAR,
    analysis: ANALYSIS,
    questions: QUESTIONS,
  };
})();
