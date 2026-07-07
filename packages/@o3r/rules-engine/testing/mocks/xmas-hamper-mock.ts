export interface Item {
  id: string;
  price: string;
}

export interface XmasHamper {
  id: string;
  hamperItems: Item[];
}

export const xmasHamper: XmasHamper = {
  id: 'hamperId',
  hamperItems: [
    {
      id: 'terrine',
      price: '10'
    }, {
      id: 'foieGras',
      price: '50'
    }
  ]
};
