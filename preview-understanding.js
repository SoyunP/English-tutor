/* 레슨별 '수업 이해 체크' 5문제.
 * keywords: 모두 포함되면 정답으로 본다. 각 항목은 [대안1, 대안2, ...] 중 하나만 있으면 된다.
 * keywords가 비어 있으면 자유 답변(내용만 쓰면 통과).
 */
(function () {
  const U = {
    l5: [
      { q: "What are self-portraits?", model: "They are pictures of the painters themselves.", keywords: [["picture", "painting"], ["themselves", "himself", "herself", "own"]], ko: "자화상은 화가가 자기 자신을 그린 그림이에요." },
      { q: "How are selfies and self-portraits similar?", model: "Both show our image at a certain time.", keywords: [["image", "face", "picture"], ["time", "moment"]], ko: "둘 다 특정한 시점의 우리 모습을 보여 줘요." },
      { q: "How did Rembrandt paint pictures of himself?", model: "He looked in the mirror and painted himself.", keywords: [["mirror"]], ko: "렘브란트는 거울을 보며 자신을 그렸어요." },
      { q: "How are selfies and self-portraits different?", model: "Taking a selfie is easy and quick, but painting a self-portrait takes time.", keywords: [["easy", "quick", "fast"], ["time", "long", "slow", "style"]], ko: "셀피는 쉽고 빠르지만, 자화상은 시간이 걸리고 화가의 스타일이 드러나요." },
      { q: "Why did Vincent van Gogh paint himself?", model: "Because he didn't have enough money for a model.", keywords: [["money"], ["model"]], ko: "모델을 구할 돈이 충분하지 않았기 때문이에요." },
    ],
    l6: [
      { q: "What day is October 9 in Korea?", model: "It is Hangeul Day, a special day for Hangeul.", keywords: [["hangeul"]], ko: "10월 9일은 한글날이에요." },
      { q: "Why does Pueng like Hangeul?", model: "Because it is easy to learn.", keywords: [["easy"]], ko: "한글은 배우기 쉬워서 좋아해요." },
      { q: "What does the word '스위스' look like to Anna?", model: "It looks like a soldier between two mountains.", keywords: [["soldier"], ["mountain"]], ko: "두 산 사이에 있는 군인처럼 보여요." },
      { q: "Why did Pueng start learning Hangeul?", model: "Because Pueng wanted to sing Korean songs.", keywords: [["sing", "song", "k-pop"]], ko: "한국 노래(K-pop)를 부르고 싶어서 배우기 시작했어요." },
      { q: "What did William want to teach to his students?", model: "He wanted to teach the science of Hangeul.", keywords: [["science", "scientific"]], ko: "학생들에게 한글의 과학적 원리를 가르치고 싶었어요." },
    ],
    l7: [
      { q: "How can recycling help the environment?", model: "It can save resources like trees and water.", keywords: [["save"], ["resource", "tree", "water", "paper"]], ko: "재활용은 나무와 물 같은 자원을 아낄 수 있어요." },
      { q: "How can you be clever at fashion?", model: "Don't buy too many clothes, and wear your clothes for a long time.", keywords: [["buy", "wear", "long", "new item", "old clothes", "useful"]], ko: "옷을 너무 많이 사지 않고, 오래 입고, 헌 옷으로 새 물건을 만들어요." },
      { q: "How long do some clothes take to break down?", model: "They take over 200 years to break down.", keywords: [["200"]], ko: "어떤 옷은 분해되는 데 200년이 넘게 걸려요." },
      { q: "Why does Water Saver feel sad?", model: "Because people waste a lot of water.", keywords: [["waste"]], ko: "사람들이 물을 많이 낭비하기 때문이에요." },
      { q: "What else can you do to save water? Think.", model: "I can use a cup when I brush my teeth.", keywords: [], ko: "정답이 정해지지 않은 질문이에요. 본문에 없는 나만의 방법을 영어로 써 보세요." },
    ],
    l8: [
      { q: "Why did people call Beatrice \"Perfect Girl\"?", model: "Because she never made mistakes.", keywords: [["mistake"]], ko: "한 번도 실수를 하지 않았기 때문이에요." },
      { q: "What happened to Beatrice in the cooking class?", model: "She stepped on something slippery and almost fell.", keywords: [["slippery", "fall", "fell", "stepped"]], ko: "미끄러운 것을 밟아 넘어질 뻔했어요." },
      { q: "What does \"Beatrice had butterflies in her stomach\" mean? Guess.", model: "It means she was very nervous.", keywords: [["nervous", "worried", "scared", "afraid"]], ko: "몹시 긴장했다는 뜻이에요." },
      { q: "What was the salt shaker full of?", model: "It was full of pepper.", keywords: [["pepper"]], ko: "소금통에는 후추가 가득 들어 있었어요." },
      { q: "How did Beatrice change after her mistake?", model: "She didn't try to be perfect anymore. She wore different socks and smiled.", keywords: [["sock", "smile", "relax", "perfect", "happy", "laugh"]], ko: "더 이상 완벽하려고 애쓰지 않고, 짝이 다른 양말을 신을 만큼 편안해졌어요." },
    ],
  };

  const data = window.LESSON_DATA || {};
  Object.keys(U).forEach((id) => {
    if (data[id]) data[id].understanding = U[id];
  });

  window.gradeUnderstanding = function (item, answer) {
    const a = String(answer || "").toLowerCase();
    if (!a.trim()) return false;
    if (!item.keywords.length) return a.trim().split(/\s+/).length >= 3;
    return item.keywords.every((group) => group.some((k) => a.includes(k.toLowerCase())));
  };
})();
