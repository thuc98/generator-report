import { LabelComponent } from "./app/components/input-components";
import { ColumnComponentBuild, LabelComponentBuild, RowComponentBuild } from "./app/models/component-build";

export interface TreeNode {
  id: string;
  children: TreeNode[]; 
  isContainer: boolean
}

export interface DropInfo {
    targetId: string;
    action?: string;
}

export var demoData: TreeNode[] = [
  new LabelComponentBuild() 
]



/*
[
  {
    "isContainer": true,
    "children": [
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 16
        },
        "id": "1405af13-1e43-41a7-b632-53423152f317",
        "index": 2,
        "content": "CÔNG TY CỔ PHẦN ABC DEXASXASX "
      },
      {
        "isContainer": true,
        "children": [
          {
            "isContainer": false,
            "children": [],
            "attributes": {
              "font-size": 16
            },
            "id": "12735277-45ad-4271-ba4d-8476a51975bc",
            "index": 4,
            "content": "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM"
          },
          {
            "isContainer": false,
            "children": [],
            "attributes": {
              "font-size": 16
            },
            "id": "56f8647d-acd2-4545-9a0e-b970003cd8e0",
            "index": 5,
            "content": "Độc lập - Tự do - Hạnh phúc"
          }
        ],
        "attributes": {},
        "id": "c81ee022-9ddf-48d8-96d7-72309d7dc0da",
        "index": 6
      }
    ],
    "attributes": {},
    "id": "ece259eb-b6dc-45cb-af37-df2a8cf28223",
    "index": 3
  },
  {
    "isContainer": true,
    "children": [],
    "attributes": {},
    "id": "b6b07ca9-ab26-4ab3-ac25-c17c4230738a",
    "index": 1
  },
  {
    "isContainer": true,
    "children": [
      {
        "isContainer": true,
        "children": [],
        "attributes": {},
        "id": "d9bfb334-17ef-4b85-a623-2e9c164b7657",
        "index": 27
      },
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 24
        },
        "id": "fe2ce264-bda1-497e-b920-5f9e6af59768",
        "index": 7,
        "content": "HOÁ ĐƠN ĐIỆN TỬ -Test 111"
      },
      {
        "isContainer": true,
        "children": [],
        "attributes": {},
        "id": "f6ea4735-7fc2-4fe1-bc85-095a4080c924",
        "index": 26
      }
    ],
    "attributes": {},
    "id": "feaa5eb5-4a78-47c7-af46-b1d28a97e393",
    "index": 25
  },
  {
    "isContainer": true,
    "children": [
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 14
        },
        "id": "43fbe5fb-6ede-4c4f-817f-7be6f9f5db04",
        "index": 8,
        "content": "Mẫu hoá đơn điện tử số 1 2 3 4 5 6 6 7 7 8 "
      }
    ],
    "attributes": {},
    "id": "d898e997-55b5-4fc9-ad0c-e52a20d1c842",
    "index": 0
  },
  {
    "isContainer": true,
    "children": [
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 14
        },
        "id": "53583cce-4339-4ba6-a7ee-907eccfac0db",
        "index": 9,
        "content": "Tên đơn vị"
      },
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 14
        },
        "id": "029e2958-18de-474e-b0c2-5ebebbb4cc42",
        "index": 12,
        "content": "Mã số thuế"
      },
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 14
        },
        "id": "9b2c335c-f137-4437-ae5f-30ce270cc84d",
        "index": 13,
        "content": "Số điện thoại"
      }
    ],
    "attributes": {},
    "id": "7df94359-ea75-4966-af5f-7c0a3f19d556",
    "index": 11
  },
  {
    "isContainer": true,
    "children": [
      {
        "isContainer": false,
        "children": [],
        "attributes": {
          "font-size": 14
        },
        "id": "b96716f0-58e2-4552-8125-edae8c29cf2b",
        "index": 14,
        "content": "Địa chỉ"
      }
    ],
    "attributes": {},
    "id": "0b6a7e83-c3ad-4a61-b74b-b016a93f178f",
    "index": 10
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "4553408b-3a8e-4e2e-8349-d6d9e4796f98",
    "index": 15,
    "content": "Nội dung tiếp tục ghi vào đây "
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "f3f5ecbd-6031-49e1-b00b-5b55d9dc7385",
    "index": 16
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "e32e7843-e2a8-4cca-aacf-1dcd033d70a4",
    "index": 17
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 30,
      "color": "rgba(151,124,197,1)"
    },
    "id": "aea4cb61-56da-41a5-a57d-8a028464673e",
    "index": 18,
    "content": "Text có màu sắc sặc ccmn sỡ =))"
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "8cc0f4f3-10ab-4ead-a766-5f1fea18fdaa",
    "index": 19
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "48cb359f-6a2e-47c0-b8cd-948a5600afe9",
    "index": 20
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "b9bd2ad6-ba30-4b07-87ed-19a1b65b3600",
    "index": 21
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 30,
      "color": "rgba(20,118,136,1)"
    },
    "id": "9549eaf0-7d97-4976-8d0b-34a5115edd1e",
    "index": 22,
    "content": "Text có size lớn 1 síu"
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "a4f57874-e269-43ff-bcf8-780cec5ee91c",
    "index": 23,
    "content": "đcm gần xong rồi "
  },
  {
    "isContainer": false,
    "children": [],
    "attributes": {
      "font-size": 14
    },
    "id": "dcff2bf1-6265-4255-be52-f53b8e9e1bc0",
    "index": 24
  }
]
*/