/* Lesson 6 · Topic 3 — Happy Hangeul Day */
(function () {
  const PARAGRAPHS = [
    {
      id: "p1",
      title: "문단 1 · 한글 축제 현장",
      summaryKo:
        "10월 9일은 한글날이다. 리포터는 한글 축제 현장에 와 있고, 사람들은 즐거운 활동을 하며 행복하고 신나 보인다. 리포터는 한글을 사랑하는 세 사람(태국에서 온 13살 학생 Pueng, 스위스에서 온 27살 디자이너 Anna, 캐나다에서 온 51살 교수 William)을 인터뷰한다.",
      en: "",
    },
    {
      id: "p2",
      title: "문단 2 · 한글을 좋아하는 이유",
      summaryKo:
        "Pueng은 한글이 배우기 쉬워서 좋아한다. 24개의 글자를 배워 어떤 한국어 단어든 읽을 수 있다. Anna는 한글의 모양이 독특하고 아름다워서 좋아하는데, '스위스'라는 단어는 두 산 사이에 있는 군인처럼 보인다고 한다. William은 한글의 역사가 놀라워서 좋아한다. 오래전 대부분의 한국인은 읽거나 쓰지 못했고, 세종대왕은 이를 안타깝게 여겨 백성을 위해 새 문자를 만들었다.",
      en: "",
    },
    {
      id: "p3",
      title: "문단 3 · 한글을 배우게 된 계기",
      summaryKo:
        "Pueng은 K-pop의 열렬한 팬이라 한국 노래를 부르고 싶어서 한글을 배우기 시작했고, 이제는 많은 노래를 부를 수 있다. Anna는 디자인에 한글을 쓰는 데 관심이 있어 한글의 모양을 공부했고, 한글로 옷의 독특한 무늬를 만든다. William은 학생들에게 한글의 과학적 원리를 가르치고 싶었다. 몇몇 글자는 소리를 낼 때의 입과 혀 모양을 닮았는데, 세종대왕이 그렇게 만들었기 때문에 매우 과학적이다.",
      en: "",
    },
  ];

  const VOCAB = [
    { word: "special", pos: "adj.", ko: "특별한", ex: "Today is a special day for my family.", exKo: "오늘은 우리 가족에게 특별한 날이다." },
    { word: "alphabet", pos: "n.", ko: "문자, 알파벳", ex: "The Korean alphabet has 24 basic letters.", exKo: "한국어 문자에는 24개의 기본 글자가 있다." },
    { word: "festival", pos: "n.", ko: "축제", forms: ["festivals"], ex: "We went to a music festival last summer.", exKo: "우리는 지난여름 음악 축제에 갔다." },
    { word: "activity", pos: "n.", ko: "활동", forms: ["activities"], ex: "Swimming is my favorite activity.", exKo: "수영은 내가 가장 좋아하는 활동이다." },
    { word: "excited", pos: "adj.", ko: "신이 난, 들뜬", ex: "The kids were excited about the trip.", exKo: "아이들은 여행 때문에 신이 났다." },
    { word: "interview", pos: "v./n.", ko: "인터뷰하다; 인터뷰", ex: "She will interview the soccer player.", exKo: "그녀는 그 축구 선수를 인터뷰할 것이다." },
    { word: "lover", pos: "n.", ko: "애호가, 좋아하는 사람", forms: ["lovers"], ex: "My uncle is a big lover of jazz.", exKo: "우리 삼촌은 재즈를 아주 좋아한다." },
    { word: "designer", pos: "n.", ko: "디자이너", ex: "The designer made a beautiful dress.", exKo: "그 디자이너는 아름다운 드레스를 만들었다." },
    { word: "professor", pos: "n.", ko: "교수", ex: "My aunt is a history professor.", exKo: "우리 이모는 역사학 교수이다." },
    { word: "question", pos: "n.", ko: "질문", ex: "May I ask you a question?", exKo: "질문 하나 해도 될까요?" },
    { word: "letter", pos: "n.", ko: "글자; 편지", forms: ["letters"], ex: "How many letters are in your name?", exKo: "네 이름에는 글자가 몇 개 있니?" },
    { word: "be able to", pos: "phr.", ko: "~할 수 있다", forms: ["am able to", "is able to", "are able to"], ex: "I am able to ride a bike now.", exKo: "나는 이제 자전거를 탈 수 있다." },
    { word: "shape", pos: "n.", ko: "모양", forms: ["shapes"], ex: "The cookie has a star shape.", exKo: "그 쿠키는 별 모양이다." },
    { word: "unique", pos: "adj.", ko: "독특한, 고유한", ex: "Her voice is very unique.", exKo: "그녀의 목소리는 아주 독특하다." },
    { word: "soldier", pos: "n.", ko: "군인", ex: "The soldier stood at the gate.", exKo: "그 군인은 정문에 서 있었다." },
    { word: "between", pos: "prep.", ko: "~ 사이에", ex: "The bank is between the school and the park.", exKo: "은행은 학교와 공원 사이에 있다." },
    { word: "history", pos: "n.", ko: "역사", ex: "I like learning about Korean history.", exKo: "나는 한국 역사를 배우는 것을 좋아한다." },
    { word: "amazing", pos: "adj.", ko: "놀라운", ex: "The view from the mountain was amazing.", exKo: "산에서 본 경치는 놀라웠다." },
    { word: "create", pos: "v.", ko: "만들어 내다, 창조하다", forms: ["created"], ex: "She created a new game for her friends.", exKo: "그녀는 친구들을 위해 새 게임을 만들었다." },
    { word: "feel bad", pos: "phr.", ko: "안타까워하다, 기분이 안 좋다", forms: ["felt bad"], ex: "I felt bad about breaking his cup.", exKo: "나는 그의 컵을 깨서 미안했다." },
    { word: "fan", pos: "n.", ko: "팬", ex: "I'm a big fan of that singer.", exKo: "나는 그 가수의 열렬한 팬이다." },
    { word: "be interested in", pos: "phr.", ko: "~에 관심이 있다", forms: ["was interested in", "am interested in"], ex: "He is interested in science.", exKo: "그는 과학에 관심이 있다." },
    { word: "design", pos: "n./v.", ko: "디자인; 디자인하다", forms: ["designs"], ex: "I like the design of this phone.", exKo: "나는 이 휴대폰의 디자인이 좋다." },
    { word: "pattern", pos: "n.", ko: "무늬, 패턴", forms: ["patterns"], ex: "The shirt has a flower pattern.", exKo: "그 셔츠에는 꽃무늬가 있다." },
    { word: "science", pos: "n.", ko: "과학", ex: "Science is my favorite subject.", exKo: "과학은 내가 가장 좋아하는 과목이다." },
    { word: "mouth", pos: "n.", ko: "입", ex: "Open your mouth and say 'ah.'", exKo: "입을 벌리고 '아' 하세요." },
    { word: "tongue", pos: "n.", ko: "혀", ex: "The soup burned my tongue.", exKo: "수프 때문에 혀를 데었다." },
    { word: "sound", pos: "n.", ko: "소리", forms: ["sounds"], ex: "I heard a strange sound outside.", exKo: "나는 밖에서 이상한 소리를 들었다." },
    { word: "scientific", pos: "adj.", ko: "과학적인", ex: "This is a scientific way to study.", exKo: "이것은 과학적인 공부 방법이다." },
    { word: "share", pos: "v.", ko: "나누다, 공유하다", forms: ["sharing"], ex: "Thank you for sharing your idea.", exKo: "아이디어를 나눠 줘서 고마워." },
  ];

  const GRAMMAR = [
    {
      title: "① 현재진행형 be + V-ing '~하고 있다'",
      body: "지금 이 순간 일어나고 있는 일을 말할 때 be동사(am/is/are) + 동사-ing를 써요.",
      inText: ["People are enjoying fun activities"],
      examples: [
        { ok: "My brother is playing a game now.", ng: "My brother playing a game now." },
        { ok: "We are watching a movie." },
      ],
      tip: "be동사를 빼먹지 않기! 주어에 맞춰 am / is / are",
    },
    {
      title: "② 감각동사 look / feel + 형용사, look like + 명사",
      body: "look(~해 보이다), feel(~하게 느끼다) 뒤에는 부사가 아니라 형용사가 와요. '~처럼 보이다'라고 명사를 쓰고 싶을 때는 look like + 명사를 써요.",
      inText: ["They look happy and excited", "look unique and beautiful", "It looks like a soldier", "It looks great", "King Sejong felt bad", "look like the shape of the mouth"],
      examples: [
        { ok: "You look tired.", ng: "You look tiredly." },
        { ok: "That cloud looks like a rabbit.", ng: "That cloud looks a rabbit." },
      ],
      tip: "look + 형용사 / look like + 명사 — 시험에 아주 자주 나와요!",
    },
    {
      title: "③ be going to + 동사원형 '~할 것이다'",
      body: "앞으로 할 계획이나 예정을 말할 때 be going to + 동사원형을 써요.",
      inText: ["I'm going to interview three Hangeul lovers"],
      examples: [{ ok: "I'm going to visit my grandma tomorrow.", ng: "I'm going to visiting my grandma." }],
      tip: "to 뒤에는 동사원형",
    },
    {
      title: "④ to부정사 — 명사적 / 부사적 용법, be able to",
      body: "want to sing(노래하는 것을 원하다)처럼 want 뒤의 to부정사는 '~하는 것을'(명사적 용법)이에요. easy to learn(배우기 쉬운)처럼 형용사 뒤의 to부정사는 '~하기에'(부사적 용법)예요. be able to는 '~할 수 있다'로 can과 같은 뜻이에요.",
      inText: ["it is easy to learn", "I am able to read any Korean word", "I wanted to sing Korean songs", "I wanted to teach the science of Hangeul"],
      examples: [
        { ok: "This book is easy to read. (읽기에 쉽다)" },
        { ok: "She is able to speak three languages. = She can speak three languages." },
      ],
      tip: "want / hope / plan + to부정사",
    },
    {
      title: "⑤ 동명사 — start / 전치사 뒤",
      body: "start(시작하다)는 뒤에 동명사(V-ing)와 to부정사를 모두 쓸 수 있어요. 전치사(in, for 등) 뒤에는 반드시 동명사를 써요.",
      inText: ["How did you start learning it?", "I started learning Hangeul", "interested in using Hangeul", "Thank you for sharing your stories"],
      examples: [
        { ok: "Thank you for helping me.", ng: "Thank you for help me." },
        { ok: "I'm interested in drawing." },
      ],
      tip: "전치사 + V-ing (for helping, in using)",
    },
    {
      title: "⑥ 접속사 because(~ 때문에) / so(그래서)",
      body: "because 뒤에는 이유가, so 뒤에는 결과가 와요.",
      inText: ["because it is easy to learn", "because its history is amazing", "Because I wanted to sing Korean songs", "so he created a new alphabet", "So I studied the shapes of Hangeul"],
      examples: [
        { ok: "I stayed home because I was sick. (이유)" },
        { ok: "I was sick, so I stayed home. (결과)" },
      ],
      tip: "because of + 명사 / because + 주어 + 동사",
    },
    {
      title: "⑦ 조동사 can / couldn't",
      body: "can은 '~할 수 있다', 과거 부정 couldn't는 '~할 수 없었다'예요. 뒤에는 항상 동사원형이 와요.",
      inText: ["Now I can sing many K-pop songs", "I can make unique patterns", "most Koreans couldn't read or write"],
      examples: [{ ok: "I couldn't sleep last night.", ng: "I couldn't slept last night." }],
      tip: "can / couldn't + 동사원형",
    },
    {
      title: "⑧ 꼭 외울 표현",
      body: "October 9, a special day for Hangeul(동격: 10월 9일 = 한글을 위한 특별한 날) · Hangeul, the Korean alphabet(동격) · a big fan of(~의 열렬한 팬) · between two mountains(두 산 사이에) · a long time ago(오래전에) · teach A to B(B에게 A를 가르치다) · Enjoy this festival!(명령문)",
      inText: [],
      examples: [],
      tip: "대명사가 가리키는 말: it(Pueng의 말) = Hangeul / They = People / this = 대부분의 한국인이 읽거나 쓰지 못하는 것",
    },
  ];

  const ANALYSIS = [
    { parts: [["People", "주어"], ["are enjoying", "동사 (현재진행)"], ["fun activities", "목적어"]], ko: "사람들은 즐거운 활동을 즐기고 있다.", note: "be + V-ing" },
    { parts: [["They", "주어 (= People)"], ["look", "감각동사"], ["happy and excited", "보어 (형용사)"]], ko: "그들은 행복하고 신나 보인다.", note: "look + 형용사" },
    { parts: [["I'm going to", "~할 것이다"], ["interview", "동사원형"], ["three Hangeul lovers", "목적어"]], ko: "나는 한글을 사랑하는 세 사람을 인터뷰할 것이다.", note: "be going to + 동사원형" },
    { parts: [["it", "주어 (= Hangeul)"], ["is", "동사"], ["easy", "보어"], ["to learn", "to부정사 (~하기에)"]], ko: "그것은 배우기 쉽다.", note: "형용사 + to부정사" },
    { parts: [["I", "주어"], ["am able to", "~할 수 있다"], ["read", "동사원형"], ["any Korean word", "목적어"]], ko: "나는 어떤 한국어 단어든 읽을 수 있다.", note: "be able to = can" },
    { parts: [["It", "주어 (= 스위스)"], ["looks like", "~처럼 보이다"], ["a soldier", "명사"], ["between two mountains", "전치사구"]], ko: "그것은 두 산 사이의 군인처럼 보인다.", note: "look like + 명사" },
    { parts: [["King Sejong", "주어"], ["felt bad", "감각동사 + 형용사"], ["about this,", "전치사구"], ["so he created a new alphabet", "결과 (그래서)"]], ko: "세종대왕은 이것을 안타깝게 여겨서 새 문자를 만들었다.", note: "feel의 과거형 felt / so = 그래서" },
    { parts: [["I", "주어"], ["started", "동사 (과거)"], ["learning Hangeul", "목적어 (동명사)"]], ko: "나는 한글을 배우기 시작했다.", note: "start + V-ing" },
    { parts: [["I", "주어"], ["was interested in", "~에 관심이 있었다"], ["using Hangeul in my designs", "동명사 (전치사 in의 목적어)"]], ko: "나는 내 디자인에 한글을 사용하는 데 관심이 있었다.", note: "전치사 뒤 동명사" },
    { parts: [["I", "주어"], ["wanted", "동사"], ["to teach the science of Hangeul", "목적어 (to부정사)"], ["to my students", "~에게"]], ko: "나는 학생들에게 한글의 과학적 원리를 가르치고 싶었다.", note: "teach A to B" },
  ];

  const QUESTIONS = [
    {
      id: "c1", points: 4,
      prompt: "다음 글의 주제로 가장 적절한 것은?",
      options: ["한글날의 유래", "한글을 사랑하는 외국인들의 인터뷰", "K-pop의 인기 비결", "세종대왕의 업적과 일생", "한글 축제를 준비하는 방법"],
      answer: 1,
      explain: "리포터가 한글 축제에서 한글을 사랑하는 세 외국인을 인터뷰하는 글이므로 ②가 주제예요.",
    },
    {
      id: "c2", points: 4,
      prompt: "다음 글의 내용과 일치하지 않는 것은?",
      options: [
        "10월 9일은 한글을 위한 특별한 날이다.",
        "Pueng은 태국에서 온 13살 학생이다.",
        "Anna는 스위스에서 온 디자이너이다.",
        "William은 한글의 역사가 놀라워서 한글을 좋아한다.",
        "William은 학생들에게 K-pop 노래를 가르치고 싶었다.",
      ],
      answer: 4,
      explain: "William은 학생들에게 한글의 과학(the science of Hangeul)을 가르치고 싶었어요. K-pop을 좋아하는 사람은 Pueng이에요.",
    },
    {
      id: "c3", points: 4,
      prompt: "Pueng이 한글을 좋아하는 이유로 가장 적절한 것은?",
      options: ["모양이 아름다워서", "배우기 쉬워서", "역사가 놀라워서", "과학적이어서", "친구가 추천해서"],
      answer: 1,
      explain: "'I like Hangeul because it is easy to learn.' — 배우기 쉬워서 좋아해요. ①은 Anna, ③은 William의 이유예요.",
    },
    {
      id: "c4", points: 4,
      prompt: "Anna에게 한글 단어 '스위스'는 무엇처럼 보이는가?",
      options: ["두 사람이 손을 잡은 모습", "두 산 사이에 있는 군인", "높은 탑", "웃는 얼굴", "나무 두 그루"],
      answer: 1,
      explain: "'It looks like a soldier between two mountains.' — ㅅ 두 개는 산, 가운데 ㅜ/ㅣ는 군인처럼 보인다고 했어요.",
    },
    {
      id: "c5", points: 4,
      prompt: "Pueng이 한글을 배우기 시작한 이유는?",
      options: ["한국 노래를 부르고 싶어서", "한국 음식을 만들고 싶어서", "한국 대학에 가고 싶어서", "옷 무늬를 만들고 싶어서", "학생들을 가르치고 싶어서"],
      answer: 0,
      explain: "'Because I wanted to sing Korean songs, I started learning Hangeul.' — K-pop 팬이라서 한국 노래를 부르고 싶었어요.",
    },
    {
      id: "c6", points: 4,
      prompt: "Anna가 한글을 이용해 만드는 것은?",
      options: ["K-pop 노래", "옷의 독특한 무늬", "한국어 교과서", "축제 포스터", "그림책"],
      answer: 1,
      explain: "'I can make unique patterns for clothes with Hangeul.' — 한글로 옷의 독특한 무늬(pattern)를 만들어요.",
    },
    {
      id: "c7", points: 4,
      prompt: "William이 한글이 과학적이라고 말한 이유로 가장 적절한 것은?",
      options: [
        "글자 수가 아주 많아서",
        "몇몇 글자가 소리를 낼 때의 입과 혀 모양을 닮아서",
        "외국인이 만든 문자라서",
        "모든 글자의 모양이 똑같아서",
        "컴퓨터로 쓰기 쉬워서",
      ],
      answer: 1,
      explain: "'Some letters look like the shape of the mouth and tongue for their sounds.' — 발음 기관의 모양을 본떠 만들었기 때문에 과학적이에요.",
    },
    {
      id: "c8", points: 4,
      prompt: "세종대왕이 새 문자를 만든 이유로 가장 적절한 것은?",
      options: [
        "다른 나라에 자랑하고 싶어서",
        "대부분의 백성이 읽거나 쓰지 못하는 것을 안타깝게 여겨서",
        "노래를 쉽게 부르게 하려고",
        "외국어를 배우게 하려고",
        "축제를 열기 위해서",
      ],
      answer: 1,
      explain: "오래전 대부분의 한국인은 읽거나 쓰지 못했고(couldn't read or write), 세종대왕은 이를 안타깝게 여겨(felt bad about this) 새 문자를 만들었어요.",
    },
    {
      id: "c9", points: 4,
      prompt: "다음 문장의 밑줄 친 it이 가리키는 것은?",
      quote: "I like Hangeul because <u>it</u> is easy to learn.",
      options: ["Korea", "Hangeul", "a festival", "a K-pop song", "October 9"],
      answer: 1,
      explain: "앞에 나온 Hangeul을 가리켜요. '한글은 배우기 쉽기 때문에 좋아한다'라는 뜻이에요.",
    },
    {
      id: "c10", points: 4,
      prompt: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
      quote: "People are enjoying fun activities here. They look ________.",
      options: ["happily", "happy", "happiness", "to happy", "happied"],
      answer: 1,
      explain: "감각동사 look 뒤에는 형용사가 와요. happily(부사)는 쓸 수 없어요.",
    },
    {
      id: "c11", points: 5,
      prompt: "다음 중 어법상 옳지 않은 문장은?",
      options: [
        "People are enjoying fun activities.",
        "I'm going to interview three people.",
        "It looks like a soldier.",
        "I started learning Hangeul.",
        "I was interested in use Hangeul.",
      ],
      answer: 4,
      explain: "전치사 in 뒤에는 동명사가 와야 해요. use → using으로 고쳐야 해요.",
    },
    {
      id: "c12", points: 5,
      prompt: "다음 중 밑줄 친 to부정사의 쓰임이 나머지와 다른 것은?",
      options: [
        "I wanted <u>to sing</u> Korean songs.",
        "I wanted <u>to teach</u> the science of Hangeul.",
        "Do you want <u>to try</u> it?",
        "Hangeul is easy <u>to learn</u>.",
        "She hopes <u>to visit</u> Korea.",
      ],
      answer: 3,
      explain: "①②③⑤는 want/hope의 목적어로 '~하는 것을'(명사적 용법)이고, ④는 형용사 easy를 꾸미는 '~하기에'(부사적 용법)예요.",
    },
    {
      id: "c13", points: 4,
      prompt: "다음 질문에 대한 대답으로 가장 적절한 것은?",
      quote: "Reporter: Why do you like Hangeul?",
      options: [
        "Yes, I do.",
        "I like it because its history is amazing.",
        "I'm from Canada.",
        "It's October 9.",
        "I'm going to the festival.",
      ],
      answer: 1,
      explain: "Why(왜)로 묻는 질문에는 because(~ 때문에)로 이유를 말해요.",
    },
    {
      id: "c14", points: 5, type: "short",
      prompt: "괄호 안의 단어를 어법에 맞게 바꾸어 쓰시오.",
      quote: "A long time ago, King Sejong (feel) bad about this.",
      accepted: ["felt"],
      modelAnswer: "felt",
      explain: "과거 이야기(A long time ago)이므로 feel의 과거형 felt를 써요. (feel - felt - felt)",
    },
    {
      id: "c15", points: 6, type: "short",
      prompt: "다음 우리말과 일치하도록 주어진 단어를 모두 배열하여 문장을 완성하시오.",
      quote: "나는 한글을 사랑하는 세 사람을 인터뷰할 것이다.\n[ to / going / I'm / interview ] three Hangeul lovers.",
      accepted: ["i'm going to interview", "i am going to interview", "i'm going to interview three hangeul lovers", "i am going to interview three hangeul lovers"],
      modelAnswer: "I'm going to interview three Hangeul lovers.",
      explain: "미래의 계획은 be going to + 동사원형으로 써요.",
    },
  ];

  window.LESSON_DATA = window.LESSON_DATA || {};
  window.LESSON_DATA.l6 = {
    lessonNo: 6,
    lessonTitle: "Amazing Korea",
    title: "Happy Hangeul Day",
    titleKo: "행복한 한글날 — 한글을 사랑하는 세계인들의 인터뷰를 읽고 한글의 우수성을 알아보는 글",
    storageKey: "englishlab.lesson6.topic3",
    paragraphs: PARAGRAPHS,
    vocab: VOCAB,
    grammar: GRAMMAR,
    analysis: ANALYSIS,
    questions: QUESTIONS,
  };
})();
