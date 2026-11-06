import { apiRequest } from '../http';
import { authStorage } from '../auth';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

// Mock state persisted in memory for development if mocks are enabled
let mockGroups = [
  {
    groupId: 1,
    groupName: 'CS-301 DSA Discussions',
    description: 'Official study and discussion group for Data Structures & Algorithms.',
    groupImage: null,
    status: 'ACTIVE',
    courseId: 1,
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS-301',
    section: 'Section 01',
    teacherId: 2,
    teacherName: 'Prof. Priya Sharma',
    memberCount: 3,
    unreadCount: 0,
    isTeacherOwner: true,
    lastMessage: {
      messageId: 3,
      senderId: 2,
      senderName: 'Prof. Priya Sharma',
      senderRole: 'FACULTY',
      messageContent: 'Yes Rahul, please include both! Random keys will demonstrate average case logarithmic height balance.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    groupId: 2,
    groupName: 'CS-301 AVL Trees Project Team',
    description: 'Working group for the upcoming AVL tree balance benchmark assignment.',
    groupImage: null,
    status: 'ACTIVE',
    courseId: 1,
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS-301',
    section: 'Section 01',
    teacherId: 2,
    teacherName: 'Prof. Priya Sharma',
    memberCount: 2,
    unreadCount: 1,
    isTeacherOwner: true,
    lastMessage: {
      messageId: 4,
      senderId: 20,
      senderName: 'Rahul Sharma',
      senderRole: 'STUDENT',
      messageContent: 'I will finish writing the test harness tonight.',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

let mockMessages = {
  1: [
    {
      messageId: 1,
      groupId: 1,
      senderId: 2,
      senderName: 'Prof. Priya Sharma',
      senderRole: 'FACULTY',
      isTeacherSender: true,
      messageContent: 'Welcome to the CS-301 discussion group! Please use this group to ask questions about assignments, lecture concepts, and project milestones.',
      messageType: 'ANNOUNCEMENT',
      isPinned: true,
      pinnedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      pinnedByName: 'Prof. Priya Sharma',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      messageId: 2,
      groupId: 1,
      senderId: 20,
      senderName: 'Rahul Sharma',
      senderRole: 'STUDENT',
      isTeacherSender: false,
      messageContent: 'Hello Professor! For Assignment 1, should our AVL tree benchmarks include random vs sequential insertions?',
      messageType: 'TEXT',
      isPinned: false,
      pinnedAt: null,
      pinnedByName: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      messageId: 3,
      groupId: 1,
      senderId: 2,
      senderName: 'Prof. Priya Sharma',
      senderRole: 'FACULTY',
      isTeacherSender: true,
      messageContent: 'Yes Rahul, please include both! Random keys will demonstrate average case logarithmic height balance.',
      messageType: 'TEXT',
      isPinned: false,
      pinnedAt: null,
      pinnedByName: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  2: [
    {
      messageId: 4,
      groupId: 2,
      senderId: 20,
      senderName: 'Rahul Sharma',
      senderRole: 'STUDENT',
      isTeacherSender: false,
      messageContent: 'I will finish writing the test harness tonight.',
      messageType: 'TEXT',
      isPinned: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
};

let mockMembers = {
  1: [
    {
      userId: 2,
      name: 'Prof. Priya Sharma',
      email: 'priya.sharma@geu.edu',
      role: 'FACULTY',
      isTeacher: true,
      joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      userId: 20,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@geu.edu',
      role: 'STUDENT',
      isTeacher: false,
      joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      userId: 21,
      name: 'Neha Patel',
      email: 'neha.patel@geu.edu',
      role: 'STUDENT',
      isTeacher: false,
      joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  2: [
    {
      userId: 2,
      name: 'Prof. Priya Sharma',
      email: 'priya.sharma@geu.edu',
      role: 'FACULTY',
      isTeacher: true,
      joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      userId: 20,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@geu.edu',
      role: 'STUDENT',
      isTeacher: false,
      joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

// ---------------------------------------------------------
// Group Management APIs
// ---------------------------------------------------------

export async function listMyGroups() {
  if (useMocks) {
    const user = authStorage.getUser();
    const isTeacher = user?.role === 'PROFESSOR' || user?.role === 'FACULTY';
    return mockGroups.map((g) => ({
      ...g,
      isTeacherOwner: isTeacher,
      unreadCount: isTeacher ? 0 : g.unreadCount,
    }));
  }
  return apiRequest('/chat/groups');
}

export async function getGroupDetails(groupId) {
  if (useMocks) {
    const g = mockGroups.find((x) => x.groupId === Number(groupId));
    if (!g) throw { status: 404, message: 'Group not found' };
    return g;
  }
  return apiRequest(`/chat/groups/${groupId}`);
}

export async function createGroup(data) {
  if (useMocks) {
    const user = authStorage.getUser();
    const newId = Date.now();
    const newGroup = {
      groupId: newId,
      groupName: data.groupName,
      description: data.description || '',
      groupImage: data.groupImage || null,
      status: 'ACTIVE',
      courseId: data.courseId,
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CS-301',
      section: 'Section 01',
      teacherId: user?.id || 2,
      teacherName: user?.name || 'Prof. Priya Sharma',
      memberCount: (data.studentIds?.length || 0) + 1,
      unreadCount: 0,
      isTeacherOwner: true,
      lastMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGroups.unshift(newGroup);
    mockMessages[newId] = [
      {
        messageId: Date.now(),
        groupId: newId,
        senderId: user?.id || 2,
        senderName: user?.name || 'Prof. Priya Sharma',
        senderRole: 'FACULTY',
        isTeacherSender: true,
        messageContent: `Group created by ${user?.name || 'Professor'}.`,
        messageType: 'SYSTEM',
        isPinned: false,
        createdAt: new Date().toISOString(),
      },
    ];
    mockMembers[newId] = [
      {
        userId: user?.id || 2,
        name: user?.name || 'Prof. Priya Sharma',
        email: user?.email || 'priya.sharma@geu.edu',
        role: 'FACULTY',
        isTeacher: true,
        joinedAt: new Date().toISOString(),
      },
    ];
    return newGroup;
  }
  return apiRequest('/chat/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateGroup(groupId, data) {
  if (useMocks) {
    const idx = mockGroups.findIndex((g) => g.groupId === Number(groupId));
    if (idx !== -1) {
      mockGroups[idx] = {
        ...mockGroups[idx],
        groupName: data.groupName || mockGroups[idx].groupName,
        description: data.description !== undefined ? data.description : mockGroups[idx].description,
        groupImage: data.groupImage !== undefined ? data.groupImage : mockGroups[idx].groupImage,
        status: data.status || mockGroups[idx].status,
        updatedAt: new Date().toISOString(),
      };
      return mockGroups[idx];
    }
  }
  return apiRequest(`/chat/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteGroup(groupId, hardDelete = false) {
  if (useMocks) {
    if (hardDelete) {
      mockGroups = mockGroups.filter((g) => g.groupId !== Number(groupId));
    } else {
      const g = mockGroups.find((x) => x.groupId === Number(groupId));
      if (g) g.status = 'ARCHIVED';
    }
    return null;
  }
  return apiRequest(`/chat/groups/${groupId}?hardDelete=${hardDelete}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------
// Member Management APIs
// ---------------------------------------------------------

export async function getGroupMembers(groupId) {
  if (useMocks) {
    return mockMembers[groupId] || [];
  }
  return apiRequest(`/chat/groups/${groupId}/members`);
}

export async function addMembers(groupId, studentIds) {
  if (useMocks) {
    const cur = mockMembers[groupId] || [];
    studentIds.forEach((id) => {
      if (!cur.some((m) => m.userId === id)) {
        cur.push({
          userId: id,
          name: id === 21 ? 'Neha Patel' : `Student ${id}`,
          email: id === 21 ? 'neha.patel@geu.edu' : `student${id}@geu.edu`,
          role: 'STUDENT',
          isTeacher: false,
          joinedAt: new Date().toISOString(),
        });
      }
    });
    mockMembers[groupId] = cur;
    return cur;
  }
  return apiRequest(`/chat/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ studentIds }),
  });
}

export async function removeMember(groupId, studentId) {
  if (useMocks) {
    if (mockMembers[groupId]) {
      mockMembers[groupId] = mockMembers[groupId].filter((m) => m.userId !== Number(studentId));
    }
    return null;
  }
  return apiRequest(`/chat/groups/${groupId}/members/${studentId}`, {
    method: 'DELETE',
  });
}

export async function getCourseEnrolledStudents(courseId) {
  if (useMocks) {
    return [
      { userId: 20, name: 'Rahul Sharma', email: 'rahul.sharma@geu.edu' },
      { userId: 21, name: 'Neha Patel', email: 'neha.patel@geu.edu' },
    ];
  }
  return apiRequest(`/chat/courses/${courseId}/students`);
}

// ---------------------------------------------------------
// Messaging & Pinned APIs
// ---------------------------------------------------------

export async function getGroupMessages(groupId) {
  if (useMocks) {
    return mockMessages[groupId] || [];
  }
  return apiRequest(`/chat/groups/${groupId}/messages`);
}

export async function sendMessage(groupId, data) {
  if (useMocks) {
    const user = authStorage.getUser();
    const isTeacher = user?.role === 'PROFESSOR' || user?.role === 'FACULTY';
    const newMsg = {
      messageId: Date.now(),
      groupId: Number(groupId),
      senderId: user?.id || (isTeacher ? 2 : 20),
      senderName: user?.name || (isTeacher ? 'Prof. Priya Sharma' : 'Rahul Sharma'),
      senderRole: isTeacher ? 'FACULTY' : 'STUDENT',
      isTeacherSender: isTeacher,
      messageContent: data.messageContent,
      messageType: data.messageType || 'TEXT',
      isPinned: false,
      pinnedAt: null,
      pinnedByName: null,
      createdAt: new Date().toISOString(),
    };
    if (!mockMessages[groupId]) mockMessages[groupId] = [];
    mockMessages[groupId].push(newMsg);

    // Update group's last message
    const g = mockGroups.find((x) => x.groupId === Number(groupId));
    if (g) {
      g.lastMessage = {
        messageId: newMsg.messageId,
        senderId: newMsg.senderId,
        senderName: newMsg.senderName,
        senderRole: newMsg.senderRole,
        messageContent: newMsg.messageContent,
        createdAt: newMsg.createdAt,
      };
      g.updatedAt = new Date().toISOString();
    }
    return newMsg;
  }
  return apiRequest(`/chat/groups/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markAsRead(groupId) {
  if (useMocks) {
    const g = mockGroups.find((x) => x.groupId === Number(groupId));
    if (g) g.unreadCount = 0;
    return null;
  }
  return apiRequest(`/chat/groups/${groupId}/read`, {
    method: 'POST',
  });
}

export async function pinMessage(groupId, messageId, pinned = true) {
  if (useMocks) {
    const msgs = mockMessages[groupId] || [];
    const m = msgs.find((x) => x.messageId === Number(messageId));
    if (m) {
      m.isPinned = pinned;
      m.pinnedAt = pinned ? new Date().toISOString() : null;
      m.pinnedByName = pinned ? 'Prof. Priya Sharma' : null;
    }
    return m;
  }
  return apiRequest(`/chat/groups/${groupId}/messages/${messageId}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ pinned }),
  });
}

export async function getPinnedMessages(groupId) {
  if (useMocks) {
    const msgs = mockMessages[groupId] || [];
    return msgs.filter((m) => m.isPinned);
  }
  return apiRequest(`/chat/groups/${groupId}/pinned`);
}

export async function deleteMessageForEveryone(groupId, messageId) {
  if (useMocks) {
    const msgs = mockMessages[groupId];
    if (msgs) {
      mockMessages[groupId] = msgs.filter((m) => m.messageId !== Number(messageId));
    }
    return null;
  }
  return apiRequest(`/chat/groups/${groupId}/messages/${messageId}`, {
    method: 'DELETE',
  });
}
