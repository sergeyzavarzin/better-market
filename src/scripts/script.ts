import { TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions";
import { input } from "@inquirer/prompts";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import OpenAI from "openai";
import { type z } from "zod";
import "dotenv/config";

import { getItemParamsByMessageResult } from "~/lib/ai/validators";

const apiId = Number(process.env.TG_API_ID!);
const apiHash = process.env.TG_API_HASH!;
const group = process.env.TG_GROUP_NAME!;
const phoneNumber = process.env.TG_PHONE_NUMBER!;

const storeSession = new StoreSession("./tg_session");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const NO_GROUPED = "no-grouped";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGE = `
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

Examples:
- "I have a new iPhone 13 Pro for sale. Price is $999." -> {"name": "iPhone 13 Pro", "price": 999, "currency": "USD", "valid": true}
- "лучшее место для размещения вакансий и поиска работы чат ВАКАНСИИ" -> {"valid": false}
- "Куплю левый наушник аирподс 3." -> {"valid": false}
- "Продаю куртку, размер L, цвет черный, цена 100 лари." -> {"name": "Куртка", "price": 100, "currency": "GEL", "valid": true}
- "Babor Retinol power serum ampoules 6 ампул из 7 (открывашка есть) // 120 лари (новый набор стоит ~6500₽). Aravia AHA-Glycolic тоник остаток 3/4 // годен до 10.24 // 20 лари Без торга!" -> {"name": "Косметика (Babor, Aravia)", "price": 20, "currency": "GEL", "valid": true}
- "Ботинки женские натур. кожа Ecco, состояние нормальное, размер 38 - 15 лари. В идеальном состоянии вещи на мальчика за 10 лари. Рубашка Ostin 140 размер (немного б/у) хлопок 60%Полиэстер / 40% - 5 лари. Поло Futurino 140 размер (новое) 100%хлопок - 5 лари." -> {"name": "Одежда женская", price": 10, "currency": "GEL", "valid": true}
- "Продам пальто Mango Man. Размер: S. Состав: 37% шерсть. Цена: 100 лари" -> {"name": "Пальто Mango Man", "price": 100, "currency": "GEL", "valid": true}
`;

export const getItemParamsByMessage = async (
  message: string,
  config?: { ai: OpenAI; model: string; systemMessage?: string },
): Promise<z.infer<typeof getItemParamsByMessageResult>> => {
  const ai = config?.ai ?? openai;
  const model = config?.model ?? "gpt-3.5-turbo";
  const systemMessage = config?.systemMessage ?? SYSTEM_MESSAGE;

  const response = await ai.chat.completions.create({
    model,
    temperature: 0,
    // tools: [
    //   {
    //     type: "function",
    //     function: {
    //       name: "transformTextToParams",
    //       description:
    //         "Refactor message content for database entry: Convert product/service sale information into database parameters. Include functionality to aggregate data for messages containing multiple products. \n",
    //       parameters: {
    //         type: "object",
    //         properties: {
    //           name: {
    //             type: "string",
    //             description: "The grouped name of the product or service",
    //           },
    //           description: {
    //             type: "string",
    //             description:
    //               "The grouped description of the product or service",
    //           },
    //           price: {
    //             type: "number",
    //             description: "The price of the product or service",
    //           },
    //           currency: {
    //             type: "string",
    //             description:
    //               "The currency code. Example: $,usd,долларов,баксов -> USD; р,руб,рублей -> RUB; lari,l,L,лар,лари,gel -> GEL;",
    //           },
    //         },
    //         required: ["name", "description", "price", "currency"],
    //       },
    //     },
    //   },
    // ],
    messages: [
      { role: "system", content: systemMessage },

      {
        role: "user",
        content:
          'Продам 27" 4K монитор LG 27UP550\n' +
          "\n" +
          "Разрешение 3840x2160, UHD, HDR, состояние прекрасное.\n" +
          "\n" +
          "Использовал 2 месяца, сейчас он живет в коробке.\n" +
          "\n" +
          "Регулируется во всех плоскостях, есть масса входов и выходов, из минусов - «не готовит завтраки»\n" +
          "\n" +
          "Цена 400$ \n" +
          "#монитор",
      },
      {
        role: "assistant",
        content:
          '{"name": "27 4K монитор LG 27UP550","description": "Разрешение 3840x2160, UHD, HDR, состояние прекрасное. Использовал 2 месяца, сейчас он живет в коробке. Регулируется во всех плоскостях, есть масса входов и выходов, из минусов - «не готовит завтраки»","price":400, "currency":"USD","valid": true}',
      },

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

  // if (response.choices[0]?.message.function_call) {
  //   const functionName: string = response.choices[0].message.function_call.name;
  //
  //   try {
  //     switch (functionName) {
  //       case "getOrganizationByName":
  //         const organizationResponse = await getOrganizationByName(
  //           JSON.parse(
  //             response.choices[0].message.function_call.arguments,
  //           ) as SearchArgs,
  //         );
  //         return { response: organizationResponse, search: null };
  //       case "getApolloSearchParamsOrganizationByName":
  //       default:
  //         const search = await getApolloSearchParamsOrganizationByName(
  //           JSON.parse(
  //             response.choices[0].message.function_call.arguments,
  //           ) as SearchArgs,
  //         );
  //         return { response: null, search };
  //     }
  //   } catch (error: unknown) {
  //     throw new Error(
  //       `[openai] error calling function ${functionName}: ${JSON.stringify(
  //         error,
  //       )}`,
  //     );
  //   }
  // }
};

const main = async () => {
  // https://gram.js.org/beta
  const client = new TelegramClient(storeSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  if (!(await client.isUserAuthorized())) {
    await client.start({
      phoneNumber,
      // password: async () => await input.text("Please enter your password: "),
      phoneCode: async () =>
        await input({ message: "Please enter the code you received: " }),
      onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log(client.session.save()); // Save this string to avoid logging in again
  }

  const today = dayjs();
  const finishDate = today.subtract(30, "minutes");

  const groupImages = new Map<string, string[]>();

  for await (const message of client.iterMessages(group)) {
    if (dayjs(message.date).isAfter(finishDate)) {
      console.log("Message is too old", message.date, finishDate);
      break;
    }

    const file = await client.downloadMedia(message);

    let filePath: string | undefined = undefined;

    if (file?.length) {
      const groupId = message?.groupedId?.toString() ?? NO_GROUPED;
      const images = groupImages.get(groupId) ?? [];
      const { data, error } = await supabase.storage
        .from("files")
        .upload(`images/${groupId}/${message.id.toString()}.jpg`, file, {
          upsert: false,
          contentType: "image/jpeg",
        });

      if (error) {
        console.error(error);
      } else if (data) {
        filePath = data.path;
        groupImages.set(groupId, [...images, filePath]);
        console.log(data);
      }
    }

    if (message.text) {
      const params = await getItemParamsByMessage(message.text);

      if (params.valid) {
        const insertItem = await supabase.from("items").insert({
          message_id: message.id,
          name: params.name,
          description: message.text,
          price: params.price,
          currency: params.currency,
          seller_id: message.senderId,
          group_id: message.groupedId,
          images: message.groupedId
            ? groupImages.get(message.groupedId.toString())
            : filePath
              ? [filePath]
              : null,
        });

        if (insertItem.error) {
          console.error(insertItem.error);
        } else if (insertItem.data) {
          console.log(insertItem.data);
        }
      }
    }
  }

  return true;
};

main()
  .catch(console.error)
  .finally(() => process.exit(0));
