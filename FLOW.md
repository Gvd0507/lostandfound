# LoFo - Lost & Found System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           LoFo SYSTEM FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

USER → Submit Report (Lost/Found)
       • Description, Time, Location, Image
                    ↓
          Store in Database
                    ↓
       ┌────────────────────────┐
       │   MATCHING ENGINE      │
       │  Compare Entries:      │
       │  • Category            │
       │  • Description         │
       │  • Time & Location     │
       └────────────────────────┘
                    ↓
       Calculate Confidence Score
       (Weighted similarity: 0-100%)
                    ↓
         Score ≥ Threshold?
            ├─ YES → Notify Users (Match Found!)
            └─ NO  → Continue monitoring

Tech Stack: React → Node.js → PostgreSQL | ML: TensorFlow.js
```
