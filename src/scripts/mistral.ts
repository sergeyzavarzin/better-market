import OpenAI from "openai";
import { type z } from "zod";
import { getItemParamsByMessageResult } from "~/lib/ai/validators";

const ai = new OpenAI({
  baseURL: "http://127.0.0.1:11434/v1",
  apiKey: "",
});

const systemMessageRu = `
Пожалуйста, извлеките следующую информацию из данного текста и верните ее в виде объекта JSON:

name: Сгруппированное название продукта или услуги
price: Цена продукта или услуги
currency: Код валюты
valid: Валидность входного текста. Булево (истина или ложь)

Специальные инструкции:

Убедитесь, что валюта всегда представлена одним и тем же кодом валюты. Пример: $,usd,долларов,баксов -> USD; р,руб,рублей -> RUB; lari,l,L,лар,лари,gel -> GEL;
Если сообщение содержит информацию о нескольких продуктах, пожалуйста, соберите данные в один объект ответа.
Если сообщение содержит какую-либо дополнительную информацию, пожалуйста, игнорируйте ее и возвращайте только запрошенные данные.
Если сообщение не содержит информации о продаже продуктов или услуг, или содержит информацию о покупке, пожалуйста, установите поле 'valid' в значение false.
Если сообщение содержит информацию о многих продуктах, то сгруппируйте ее и выберите среднюю минимальную цену из представленных данных.
Информация должна быть настолько убедительной, насколько это возможно, предназначенной для того, чтобы сделать продукт, который она представляет, абсолютно неотразимым для покупки. Используйте лучшие практики маркетинга для этой цели. Также учитывайте, что эта информация будет размещена на веб-сайте и должна быть идеально подходящей для этого контекста.
Ответ не должен содержать никакого дополнительного вывода, только объект JSON.
Отвечайте на языке, представленном во входном тексте.
Примеры:

"I have a new iPhone 13 Pro for sale. Price is $999." -> {"name": "iPhone 13 Pro", "price": 999, "currency": "USD", "valid": true}
"лучшее место для размещения вакансий и поиска работы чат ВАКАНСИИ" -> {"valid": false}
"Куплю левый наушник аирподс 3." -> {"valid": false}
"Продаю куртку, размер L, цвет черный, цена 100 лари." -> {"name": "Куртка", "price": 100, "currency": "GEL", "valid": true}
"Babor Retinol power serum ampoules 6 ампул из 7 (открывашка есть) // 120 лари (новый набор стоит ~6500₽). Aravia AHA-Glycolic тоник остаток 3/4 // годен до 10.24 // 20 лари Без торга!" -> {"name": "Косметика (Babor, Aravia)", "price": 20, "currency": "GEL", "valid": true}
`.trim();

const systemMessage = `
Please extract the following information from the given text and return it as a JSON object:

name: The grouped name of the product or service
price: The price of the product or service
currency: The currency code
valid: Validity of the input text. Boolean (true or false)

Special instructions:
- Make sure that currency is always represents the same currency code. Example: $,usd,долларов,баксов -> USD; р,руб,рублей -> RUB; lari,l,L,лар,лари,gel -> GEL;
- If the message contains multiple products, please aggregate the data into a single response object.
- If the message contains any additional information, please ignore it and only return the requested data.
- If the message is not contains any information about selling products or services, or contains information about buying, please set the 'valid' field to false.
- If the message contains information about many products then group it and select medium lowest price from presented data.
- The information should be as persuasive as possible, designed to make the product it represents utterly irresistible to buy. Utilize the best marketing practices for this purpose. Also, consider that this information will be placed on a website and should be perfectly suited for this context.
- Response should not contain any additional output, only JSON object.
- Respond with language that presented in the input text.

Examples:
- "I have a new iPhone 13 Pro for sale. Price is $999." -> {"name": "iPhone 13 Pro", "price": 999, "currency": "USD", "valid": true}
- "лучшее место для размещения вакансий и поиска работы чат ВАКАНСИИ" -> {"valid": false}
- "Куплю левый наушник аирподс 3." -> {"valid": false}
- "Продаю куртку, размер L, цвет черный, цена 100 лари." -> {"name": "Куртка", "price": 100, "currency": "GEL", "valid": true}
- "Babor Retinol power serum ampoules 6 ампул из 7 (открывашка есть) // 120 лари (новый набор стоит ~6500₽). Aravia AHA-Glycolic тоник остаток 3/4 // годен до 10.24 // 20 лари Без торга!" -> {"name": "Косметика (Babor, Aravia)", "price": 20, "currency": "GEL", "valid": true}
- "Ботинки женские натур. кожа Ecco, состояние нормальное, размер 38 - 15 лари. В идеальном состоянии вещи на мальчика за 10 лари. Рубашка Ostin 140 размер (немного б/у) хлопок 60%Полиэстер / 40% - 5 лари. Поло Futurino 140 размер (новое) 100%хлопок - 5 лари." -> {"name": "Одежда женская", price": 10, "currency": "GEL", "valid": true}
- "Продам пальто Mango Man. Размер: S. Состав: 37% шерсть. Цена: 100 лари" -> {"name": "Пальто Mango Man", "price": 100, "currency": "GEL", "valid": true}

`.trim();

export const getItemParamsByMessage = async (
  message: string,
): Promise<z.infer<typeof getItemParamsByMessageResult>> => {
  const response = await ai.chat.completions.create({
    model: "vikhr" || "mixtral" || "mistral" || "gemma" || "llama2",
    // temperature: 0,
    messages: [
      { role: "system", content: systemMessageRu || systemMessage },
      { role: "user", content: message },
    ],
  });

  console.log(JSON.stringify(response, null, 2));

  if (!response?.choices?.[0]?.message?.content) {
    return { valid: false, name: "", price: 0, currency: "" };
  }

  return getItemParamsByMessageResult.parse(
    JSON.parse(response.choices[0].message.content),
  );
};

getItemParamsByMessage(
  "Продается кошелек из натуральной кожи Lacoste. Абсолютно новый, в коробке. Покупался в качестве подарка, но не подошел. Покупала за 350 лари, продам за 290. Территориально Ваке/Вера. За вопросами пишите в лс",
)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
