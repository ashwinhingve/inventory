import { useState, useEffect } from 'react';
import { useCombobox } from 'downshift';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Party {
  _id: string;
  name: string;
  mobileNumber?: string;
  balanceType: 'Payable' | 'Receivable';
}

interface PartySelectorProps {
  selectedPartyId?: string;
  onPartySelect: (partyId: string) => void;
  onCreateParty?: (partyName: string) => Promise<string | null>;
  placeholder?: string;
  className?: string;
}

export default function PartySelector({
  selectedPartyId,
  onPartySelect,
  onCreateParty,
  placeholder = 'Select or create a party',
  className = ''
}: PartySelectorProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/parties');
      if (!response.ok) throw new Error('Failed to fetch parties');
      const data = await response.json();
      setParties(data.parties || []);
    } catch {
      console.error('Error fetching parties');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParties = Array.isArray(parties) 
    ? parties.filter(party =>
        party.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    reset
  } = useCombobox({
    items: filteredParties,
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue || '');
    },
    onSelectedItemChange: async ({ selectedItem }) => {
      if (selectedItem) {
        onPartySelect(selectedItem._id);
        reset();
      }
    },
    itemToString: (item) => item?.name || '',
  });

  const handleCreateParty = async () => {
    if (!onCreateParty || !inputValue.trim()) return;

    try {
      setIsLoading(true);
      const newPartyId = await onCreateParty(inputValue.trim());
      if (newPartyId) {
        await fetchParties();
        onPartySelect(newPartyId);
        setInputValue('');
        toast.success('Party created successfully');
      }
    } catch {
      toast.error('Failed to create party');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedParty = Array.isArray(parties) 
    ? parties.find(p => p._id === selectedPartyId)
    : undefined;

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            {...getInputProps()}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-md p-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
            value={selectedParty ? selectedParty.name : inputValue}
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            </div>
          )}
        </div>
        {inputValue && !selectedParty && (
          <button
            type="button"
            onClick={handleCreateParty}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create
          </button>
        )}
      </div>

      <ul
        {...getMenuProps()}
        className={`absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${
          !isOpen && 'hidden'
        }`}
      >
        {isOpen &&
          filteredParties.map((party, index) => (
            <li
              key={party._id}
              {...getItemProps({ item: party, index })}
              className={`cursor-default select-none relative py-2 pl-3 pr-9 ${
                highlightedIndex === index ? 'bg-blue-600 text-white' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <span className="font-medium block truncate">{party.name}</span>
                {party.mobileNumber && (
                  <span className={`ml-2 text-sm ${highlightedIndex === index ? 'text-blue-200' : 'text-gray-500'}`}>
                    {party.mobileNumber}
                  </span>
                )}
              </div>
            </li>
          ))}
        {isOpen && filteredParties.length === 0 && inputValue && (
          <li className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
            No parties found. Type to create a new one.
          </li>
        )}
      </ul>
    </div>
  );
} 