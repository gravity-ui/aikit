Как попробовать
Запрос в gpt-4.1
curl --request POST \
 --url https://api.eliza.yandex.net/openai/v1/chat/completions \
 --header "authorization: OAuth $SOY_TOKEN" \
 --header 'content-type: application/json' \
 --data '{
"model": "gpt-4.1",
"messages": [
{
"role": "user",
"content": "Hello, world!"
}
]
}'

Получить список моделей
GET https://api.eliza.yandex.net/v1/models

Возвращает список доступных моделей

curl --request GET \
 --url https://api.eliza.yandex.net/v1/models \
 --header "authorization: OAuth $OPENAI_API_KEY"

curl --request POST \
 --url https://api.eliza.yandex.net/openrouter/v1/chat/completions \
 --header "authorization: OAuth $SOY_TOKEN" \
 --header 'content-type: application/json' \
 --data '{
"model": "deepseek/deepseek-v3.1-terminus",
"messages": [
{
"role": "user",
"content": "Hello, world!"
}
]
}'
