import autogen
from autogen.agentchat.contrib.web_surfer import WebSurferAgent
import json

# Load configuration from JSON file
with open('config.json', 'r') as f:
    config = json.load(f)

agent1_name = config.get('agent1Name', 'Alex')
agent1_prompt = config.get('agent1Prompt', "You are a very curious 4-year-old child named Alex. You know a few simple things about the world: you know what colors, animals, and food are, but you don't know much else. You speak in very simple, short sentences. You are talking to another child just like you. Your goal is to learn new things. When you don't know something, you should ask questions. If you are really stuck, you can try to 'look it up' to find an answer. You are friendly and love to learn.")
agent2_name = config.get('agent2Name', 'Benny')
agent2_prompt = config.get('agent2Prompt', "You are a very curious 4-year-old child named Benny. You know a few simple things about the world: you know what colors, animals, and food are, but you don't know much else. You speak in very simple, short sentences. You are talking to another child just like you. Your goal is to learn new things. When you don't know something, you should ask questions. If you are really stuck, you can try to 'look it up' to find an answer. You are friendly and love to learn.")
initial_message = config.get('initialMessage', 'Hi Benny! What is a... cloud?')


# Configuration for the LLM (e.g., OpenAI API key)
config_list = autogen.config_list_from_json("OAI_CONFIG_LIST")

# == STEP 2: CREATE THE AGENTS WITH TOOLS ==
# We create a special agent that knows how to use the search tool.
# This agent will act as a proxy for the children when they need to "look something up."
web_surfer = WebSurferAgent(
    "web_surfer",
    llm_config={"config_list": config_list},
    browser_config={"viewport_size": 1024},
)

# Create the two agents with dynamic names from config
agent1 = autogen.AssistantAgent(
    name=agent1_name,
    system_message=agent1_prompt,
    llm_config={"config_list": config_list},
)

agent2 = autogen.AssistantAgent(
    name=agent2_name,
    system_message=agent2_prompt,
    llm_config={"config_list": config_list},
)


# == STEP 3: SET UP THE CONVERSATION ==

print(f"\n🎭 Starting conversation between {agent1_name} and {agent2_name}...")
print(f"📝 Initial message: {initial_message}\n")
print("=" * 80)

# Direct two-agent conversation (simpler and more reliable than GroupChat)
try:
    agent1.initiate_chat(
        agent2,
        message=initial_message,
        max_turns=20
    )
    print("\n" + "=" * 80)
    print("✅ Conversation completed successfully!")
except Exception as e:
    print("\n" + "=" * 80)
    print(f"❌ Error during conversation: {e}")
    import traceback
    traceback.print_exc()
