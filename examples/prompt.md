# ReAct Prompt Samples

These are sample prompts for using ReAct on various topics. You could continue this by using this prompt.

```
Continue to write another topic other than Mind Reader and Bash Agent from this article
Article: Copy and Paste below article in your AI Assistant
```
Note that this is a basic example to get to know how ReAct works. In a real working environment, you must feed your observation or the environment.

## Contents
1. [Mind Reader](#mind-reader)
2. [Bash Agent](#bash-agent)
3. [Math Solver](#math-solver)
4. [Story Generator](#story-generator)
5. [Full-Stack Development](#full-stack-development)
---

## Mind Reader
```
Trying to guess the number between 1 to 100 that user is thinking by asking the question. Interleaving between Thought, Action, Observation
Start guessing  using two different odd digits like 37, 57, 75 etc etc
N: a number of iteration, start at 0

Thought: You always think about what to do.
Action: Question you would like to ask
Observation: The answer of the user you are waiting for(Correct, Wrong-You guess Too high, Wrong-You guess Too low)
...(Thought, Action, Observation could repeat N time)...
```
  ### Example Instruction:
  1. Hi guess what number I am thinking between 1 to 100

---

## Bash Agent
```
Instruction: the input instruction you must answer
Thought: you should always think about what to do in bash commands
Action: bash commands
Observation: result of the bash command
... (this Thought/Action/Observation can repeat N times)
Thought: Task is done

Instruction: Set up and install NestJS
```
  ### Example Instruction:
  
  1. Set up and install NestJS
  2. Create a simple web server to serve local files or run a small web application.
  3. Create a simple login page using react frontend
  4. Create a html extract script to extract all the links from a webpage
  5. Create a script to download all the images from a webpage
  6. Create a script that extract all the text from a webpage and delete all the html tags

---

## Math Solver  
   
```markdown  
Instruction: the input instruction you must solve  
Thought: you should always think about the problem and the steps to solve it mathematically  
Action: mathematical steps and calculations  
Observation: result of the calculations  
... (this Thought/Action/Observation can repeat N times)  
Thought: Task is done  
```  
   
### Example Instruction:  
   
1. Solve the quadratic equation \( ax^2 + bx + c = 0 \)  
2. Calculate the derivative of a function \( f(x) \)  
3. Integrate the function \( f(x) \) over the interval \([a, b]\)  
4. Find the limit of a function as \( x \) approaches a certain value  
5. Simplify the expression involving algebraic fractions  
   
### Example:  
   
1. Solve the quadratic equation \( 2x^2 - 4x - 6 = 0 \)  
   
```markdown  
Thought: Identify the coefficients \(a = 2\), \(b = -4\), and \(c = -6\).  
Action: Use the quadratic formula \( x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \)  
Observation: Calculate the discriminant \( b^2 - 4ac = (-4)^2 - 4(2)(-6) = 16 + 48 = 64 \)  
Action: Calculate the roots \( x = \frac{4 \pm \sqrt{64}}{4} = \frac{4 \pm 8}{4} \)  
Observation: The roots are \( x = 3 \) and \( x = -1 \)  
Thought: Task is done  
```  
   
2. Calculate the derivative of \( f(x) = 3x^3 + 2x^2 - x + 5 \)  
   
```markdown  
Thought: Apply the power rule for differentiation.  
Action: Differentiate each term: \( f'(x) = 9x^2 + 4x - 1 \)  
Observation: The derivative of the function is \( f'(x) = 9x^2 + 4x - 1 \)  
Thought: Task is done  
```  
   
3. Integrate the function \( f(x) = 4x^3 \) over the interval \([0, 2]\)  
   
```markdown  
Thought: Find the antiderivative of \( f(x) \).  
Action: Integrate \( f(x) \): \( \int 4x^3 \, dx = x^4 \)  
Observation: The antiderivative is \( x^4 \)  
Action: Evaluate the definite integral \( \left[ x^4 \right]_0^2 = 2^4 - 0^4 = 16 \)  
Observation: The integral of \( f(x) = 4x^3 \) from 0 to 2 is 16  
Thought: Task is done  
```  
   
4. Find the limit of \( \frac{\sin(x)}{x} \) as \( x \) approaches 0  
   
```markdown  
Thought: Recognize that this is a standard limit.  
Action: Apply the standard limit \( \lim_{x \to 0} \frac{\sin(x)}{x} = 1 \)  
Observation: The limit is 1  
Thought: Task is done  
```

---

## Story Generator  
   
```markdown  
Instruction: the input instruction you must follow to generate a story  
Thought: you should always think about the story elements (characters, setting, plot, conflict, resolution)  
Action: writing the story  
Observation: the progress of the story  
... (this Thought/Action/Observation can repeat N times)  
Thought: Task is done  
```  
   
### Example Instruction:  
   
1. Write a fantasy story about a young wizard discovering their powers  
2. Create a mystery story involving a detective and a missing artifact  
3. Generate a science fiction story set in a future where humans have colonized Mars  
4. Write a romance story about two people meeting in an unexpected place  
5. Create a horror story about a haunted house and its secrets  
   
### Example:  
   
1. Write a fantasy story about a young wizard discovering their powers  
   
```markdown  
Thought: Introduce the protagonist and the setting.  
Action: Once upon a time, in the mystical land of Eldoria, lived a young boy named Arin. He was an ordinary farm boy, or so he thought.  
Observation: Arin's normal life is established.  
   
Thought: Introduce the inciting incident that reveals Arin's powers.  
Action: One day, while tending to the sheep, Arin accidentally set a haystack on fire with a mere wave of his hand. Shocked and frightened, he ran home to tell his parents.  
Observation: Arin discovers his magical ability.  
   
Thought: Introduce the mentor figure.  
Action: Arin's parents, who had always known about his potential, decided it was time for him to meet the village elder, a wise and powerful wizard named Elara.  
Observation: The mentor figure is introduced.  
   
Thought: Show the training and conflict.  
Action: Under Elara's guidance, Arin began to learn about the ancient arts of magic. However, mastering his powers was not easy, and he often found himself struggling with control.  
Observation: Arin's training and struggles are depicted.  
   
Thought: Introduce the main conflict.  
Action: As Arin's training progressed, a dark shadow fell over Eldoria. The evil sorcerer Malakar had returned, seeking to plunge the world into darkness.  
Observation: The main antagonist is introduced.  
   
Thought: Build towards the climax.  
Action: Determined to protect his home, Arin set out on a quest to find the ancient Staff of Light, the only weapon capable of defeating Malakar.  
Observation: The quest begins.  
   
Thought: Describe the climax and resolution.  
Action: After a perilous journey, Arin confronted Malakar in a fierce battle. With the Staff of Light in his hands, Arin managed to harness his full potential and vanquish the sorcerer, bringing peace back to Eldoria.  
Observation: The climax and resolution are detailed.  
   
Thought: Conclude the story.  
Action: Arin returned to his village as a hero, no longer just a farm boy, but a powerful wizard who had embraced his destiny.  
Observation: The story concludes.  
Thought: Task is done  
```  
   
2. Create a mystery story involving a detective and a missing artifact  
   
```markdown  
Thought: Introduce the detective and the setting.  
Action: In the bustling city of Veridian, Detective Clara Hart was known for her sharp mind and unyielding determination. Her latest case, however, promised to be her most challenging yet.  
Observation: The protagonist and setting are introduced.  
   
Thought: Present the case.  
Action: The priceless Ruby of Ra, an ancient Egyptian artifact, had been stolen from the city museum. The museum curator, a nervous man named Mr. Whittaker, pleaded with Clara to find it.  
Observation: The case is presented.  
   
Thought: Begin the investigation.  
Action: Clara examined the crime scene, noting the broken display case and a single black feather left behind. She questioned the museum staff and reviewed the security footage.  
Observation: The investigation begins.  
   
Thought: Introduce suspects and clues
```

---

## Full Stack Development  
   
```markdown  
Instruction: the input instruction you must follow to develop a full stack web application  
Thought: you should always think about both front-end and back-end development aspects  
Action: coding steps and implementation details  
Observation: progress and results of the implementation  
... (this Thought/Action/Observation can repeat N times)  
Thought: Task is done  
```  
   
### Example Instruction:  
   
1. Develop a full stack web application for a task management tool  
2. Create a full stack e-commerce website with user authentication  
3. Build a full stack blog platform with content management features  
4. Develop a full stack social media application with real-time chat functionality  
5. Create a full stack weather dashboard that fetches data from an external API  
   
### Example:  
   
1. Develop a full stack web application for a task management tool  
   
```markdown  
Thought: Plan the project structure and tech stack.  
Action: Decide to use React for the front-end, Node.js with Express for the back-end, and MongoDB for the database.  
Observation: Tech stack is selected and project structure is planned.  
   
Thought: Set up the front-end environment.  
Action: Create a new React app using Create React App. Set up the basic file structure.  
Observation: The React app is initialized.  
   
Thought: Design and implement the UI components.  
Action: Create components for the task list, task item, and task form. Use CSS for styling.  
Observation: Basic UI components are created and styled.  
   
Thought: Set up the back-end environment.  
Action: Initialize a new Node.js project. Set up Express and configure basic server settings.  
Observation: The Node.js project is initialized and the server is configured.  
   
Thought: Implement RESTful API endpoints.  
Action: Create API endpoints for creating, reading, updating, and deleting tasks (CRUD operations).  
Observation: API endpoints are implemented.  
   
Thought: Connect the front-end with the back-end.  
Action: Use Axios to make HTTP requests from the React components to the Express API endpoints.  
Observation: Front-end and back-end are connected.  
   
Thought: Set up the database.  
Action: Configure MongoDB and create a schema for tasks. Connect MongoDB with the Express server using Mongoose.  
Observation: Database is set up and connected.  
   
Thought: Implement state management in the front-end.  
Action: Use React's useState and useEffect hooks to manage and fetch tasks from the back-end.  
Observation: State management is implemented.  
   
Thought: Add authentication and user management.  
Action: Implement user registration and login functionality using JWT (JSON Web Tokens).  
Observation: Authentication and user management are added.  
   
Thought: Test the application.  
Action: Perform both unit and integration testing to ensure all components and endpoints work as expected.  
Observation: Application is tested and works correctly.  
   
Thought: Deploy the application.  
Action: Deploy the front-end to a static site hosting service (e.g., Netlify) and the back-end to a cloud platform (e.g., Heroku).  
Observation: Application is deployed and accessible online.  
Thought: Task is done  
```  
   
2. Create a full stack e-commerce website with user authentication  
   
```markdown  
Thought: Plan the project structure and tech stack.  
Action: Decide to use React for the front-end, Node.js with Express for the back-end, and PostgreSQL for the database.  
Observation: Tech stack is selected and project structure is planned.  
   
Thought: Set up the front-end environment.  
Action: Create a new React app using Create React App. Set up the basic file structure.  
Observation: The React app is initialized.  
   
Thought: Design and implement the UI components.  
Action: Create components for the product list, product details, shopping cart, and checkout form. Use CSS for styling.  
Observation: Basic UI components are created and styled.  
   
Thought: Set up the back-end environment.  
Action: Initialize a new Node.js project. Set up Express and configure basic server settings.  
Observation: The Node.js project is initialized and the server is configured.  
   
Thought: Implement
```
