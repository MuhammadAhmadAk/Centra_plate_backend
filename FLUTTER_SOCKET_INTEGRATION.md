# Centra Plate Flutter Socket Integration Guide

To integrate the real-time chat functionality into your Flutter app, follow these steps.

## 1. Add Dependency

Add the `socket_io_client` package to your `pubspec.yaml` file:

```yaml
dependencies:
  flutter:
    sdk: flutter
  socket_io_client: ^2.0.3 # Check for the latest version
```

## 2. Create a Socket Service

Create a file named `socket_service.dart` to handle all socket connections. This ensures you have a single active connection throughout the app.

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  late IO.Socket socket;

  factory SocketService() {
    return _instance;
  }

  SocketService._internal();

  // Initialize Connection
  void initConnection(String userId) {
    // Replace with your actual backend URL (e.g., 10.0.2.2 for Android Emulator)
    const String backendUrl = 'http://192.168.1.5:3000'; 

    socket = IO.io(backendUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.connect();

    socket.onConnect((_) {
      print('Connected to Socket Server');
      // Identify the user upon connection so the server knows who this is
      socket.emit('identify', userId);
    });

    socket.onDisconnect((_) {
      print('Disconnected from Socket Server');
    });

    socket.on('error', (data) {
      print('Socket Error: $data');
    });
  }

  // Send a Message
  void sendMessage({
    required String senderId,
    required String content,
    String? receiverId,
    String? receiverPlate,
  }) {
    final messageData = {
      'senderId': senderId,
      'content': content,
      if (receiverId != null) 'receiverId': receiverId,
      if (receiverPlate != null) 'receiverPlate': receiverPlate,
    };

    socket.emit('send_message', messageData);
  }

  // Listen for Incoming Messages
  void setOnMessageReceived(Function(dynamic) onMessageReceived) {
    socket.on('receive_message', (data) {
      onMessageReceived(data);
    });
  }

  // Listen for Message Sent Confirmation
  void setOnMessageSent(Function(dynamic) onMessageSent) {
    socket.on('message_sent', (data) {
      onMessageSent(data);
    });
  }

  void disconnect() {
    socket.disconnect();
  }
}
```

## 3. Usage in UI (Chat Screen)

Here is how you can use the service in your Chat Screen widget.

```dart
import 'package:flutter/material.dart';
import 'socket_service.dart'; // Import your service

class ChatScreen extends StatefulWidget {
  final String currentUserId;
  final String? targetUserId;
  final String? targetPlate;

  const ChatScreen({
    Key? key, 
    required this.currentUserId, 
    this.targetUserId, 
    this.targetPlate
  }) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final SocketService _socketService = SocketService();
  final List<Map<String, dynamic>> _messages = [];

  @override
  void initState() {
    super.initState();
    
    // Initialize connection (Best done at app startup or login, but here for demo)
    _socketService.initConnection(widget.currentUserId);

    // Listen for incoming messages
    _socketService.setOnMessageReceived((data) {
      setState(() {
        _messages.add(data); // Add incoming message to list
      });
    });

    // Listen for confirmation of sent messages
    _socketService.setOnMessageSent((data) {
       setState(() {
        _messages.add(data); // Add sent message to list
      });
    });
  }

  void _sendMessage() {
    if (_controller.text.isEmpty) return;

    _socketService.sendMessage(
      senderId: widget.currentUserId,
      content: _controller.text,
      receiverId: widget.targetUserId, // Pass ID if chatting by ID
      receiverPlate: widget.targetPlate, // Pass Plate if chatting by Plate
    );

    _controller.clear();
  }

  @override
  void dispose() {
    _socketService.disconnect(); // Clean up if needed
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Chat")),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isMe = msg['sender_id'].toString() == widget.currentUserId;
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: EdgeInsets.all(8),
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isMe ? Colors.blue : Colors.grey[300],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      msg['content'], 
                      style: TextStyle(color: isMe ? Colors.white : Colors.black)
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(hintText: "Type a message..."),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

## Key Backend Events Used

1.  **`identify`**: Sent immediately after connection to register the user's socket ID with their User ID.
2.  **`send_message`**: Emitted when sending a text.
3.  **`receive_message`**: Listener for when someone sends you a message.
4.  **`message_sent`**: Confirmation that your message was saved and sent.
