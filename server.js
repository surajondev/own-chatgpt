import express from "express"
import cors from 'cors';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { supabase, supabaseAdmin } from "./lib/supabase.js";
import { llm, embeddings } from "./lib/openai.js";
import { SupabaseHybridSearch } from "langchain/retrievers/supabase";

import {
    RunnablePassthrough,
    RunnableSequence,
  } from "langchain/schema/runnable";
  import { StringOutputParser } from "langchain/schema/output_parser";
  import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
  } from "langchain/prompts";
  import { formatDocumentsAsString } from "langchain/util/document";

const app = express();
const PORT = 5000;
app.use(cors())

// Middleware to parse JSON data
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Route for loading data
app.get('/loadingdata', async (req, res) => {
    // Simulate loading data (replace with actual loading logic)
    const loader = new PDFLoader("writing.pdf");
    const docs = await loader.load();

    const vectorStore = await SupabaseVectorStore.fromDocuments(docs, embeddings, {
        client: supabase,
        tableName: 'documents',
        queryName: 'match_documents',
    })

    res.status(200).send({message: "Data Loaded Successfully!"})
});

// Route for querying data
app.post('/querydata', async (req, res) => {
    const query = req.body.query;

    // Simulate querying data (replace with actual query logic)
    const retriever = new SupabaseHybridSearch(embeddings, {
        client: supabase,
        //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
        similarityK: 2,
        keywordK: 2,
        tableName: "documents",
        similarityQueryName: "match_documents",
        keywordQueryName: "kw_match_documents",
    });

    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
const messages = [
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
  HumanMessagePromptTemplate.fromTemplate("{question}"),
];

const prompt = ChatPromptTemplate.fromMessages(messages);


const chain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  llm,
  new StringOutputParser(),
]);


const answer = await chain.invoke(
    query
  );


  res.status(200).send({answer : answer})
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
