import { faker } from "../packages/api/node_modules/@faker-js/faker/dist/index.js";

const api = process.env.ZAP_API_URL ?? "http://127.0.0.1:8080";
const password = "Password123!";
const demographic = {
  birth_date: faker.date.birthdate({ min: 25, max: 55, mode: "age" }).toISOString().slice(0, 10),
  gender: faker.helpers.arrayElement(["m", "f"]), income: faker.number.int({ min: 30000, max: 70000 }),
  city: faker.location.city(), country: "IT", language: "en",
};
const user = (email) => ({ ...demographic, first_name: faker.person.firstName(), last_name: faker.person.lastName(), email, password });
async function post(path, body, token) {
  const response = await fetch(`${api}${path}`, { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: token } : {}) }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`);
  return response.json();
}
const lex = await post("/register", user("lex.luthor@gmail.com"));
const clark = await post("/register", user("clark.kent@gmail.com"));
const lexToken = await post("/login", { email: "lex.luthor@gmail.com", password });
const clarkToken = await post("/login", { email: "clark.kent@gmail.com", password });
const poll = await post("/polls", { name: faker.lorem.sentence(), description: faker.lorem.sentence(), opens_at: new Date().toISOString(), closes_at: new Date(Date.now() + 86400000).toISOString(), type: "single_choice", ranked_method: null, gender_restriction: null, age_min: null, age_max: null, gross_income_min: null, gross_income_max: null, cities: [], countries: [], group_id: null, is_live: false, options: [faker.lorem.word(), faker.lorem.word()] }, `Bearer ${lexToken}`);
await post(`/polls/${poll.id}/votes`, { option_ids: [poll.options[0].id] }, `Bearer ${clarkToken}`);
console.log(JSON.stringify({ lexToken: `Bearer ${lexToken}`, clarkToken: `Bearer ${clarkToken}`, pollId: poll.id }));
