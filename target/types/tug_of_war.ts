export type TugOfWar = {
  "version": "0.1.0",
  "name": "tug_of_war",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "newGameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "restartGame",
      "accounts": [
        {
          "name": "gameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "pullLeft",
      "accounts": [
        {
          "name": "gameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "pullRight",
      "accounts": [
        {
          "name": "gameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "gameDataAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerPosition",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "chestAccount",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};

export const IDL: TugOfWar = {
  "version": "0.1.0",
  "name": "tug_of_war",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "newGameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "restartGame",
      "accounts": [
        {
          "name": "gameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "pullLeft",
      "accounts": [
        {
          "name": "gameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "pullRight",
      "accounts": [
        {
          "name": "gameDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chestVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "gameDataAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerPosition",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "chestAccount",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
