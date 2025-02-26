# Chat Section Setup

** **Insert a Chat Record in the Database with your id**  
   Use the SQL statement below to insert a row into your `chats` table.  
   - Replace `xlmtxvmbxii` with your desired **chat_id** and ensure it matches your coversation json file.  
   - Replace `DutSMyuYOBugqF55KRO5e2UohdMVil1L` with your **user_id**.  
   - The other fields can remain the same.

   ```sql
   INSERT INTO chats (chat_id, uid, last_message_came, chat_note, chat_tags, sender_name, sender_mobile, chat_status, is_opened, last_message, createdAt) 
   VALUES (
     'xlmtxvmbxii',
     'DutSMyuYOBugqF55KRO5e2UohdMVil1L',
     1712555326,
     NULL,
     NULL,
     'codeyon.com',
     '918430088300',
     'open',
     1, 
     '{"type":"audio","metaChatId":"wamid.HBgMOTE4NDMwMDg4MzAwFQIAERgSMDQwRENGRUI3MDhGQ0MzMkZEAA==","msgContext":{"type":"audio","audio":{"link":"http://localhost:3000/media/ZtE9wv3dIrNgPKeKXifyxjJHylA2j1bB.mp3"}},"reaction":"","timestamp":1712555326,"senderName":"codeyon.com","senderMobile":"918430088300","status":"sent","star":false,"route":"OUTGOING","agent":"john@agent.com"}',
     '2024-03-18 09:16:25'
   );
 ```

- create a folder in the coversations folder with your user_id as the folder name  and place the coversations json file in it
